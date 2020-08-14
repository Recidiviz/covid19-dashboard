from collections import defaultdict
import csv
from datetime import datetime, timezone
from google.cloud import firestore
from google.cloud import storage
import logging
import re

REFERENCE_FACILITIES_COLLECTION_ID = 'reference_facilities'

log = logging.getLogger("cloudLogger")

# translate bigquery values to the ones we use in this app
FACILITY_TYPE_MAPPING = {
    "County Jails": "County Jail",
    "State Prisons": "State Prison",
}

fs_client = firestore.Client()
facilities_collection = fs_client.collection(
    REFERENCE_FACILITIES_COLLECTION_ID)

class FirestoreBatch():
    """
        Utility for managing Firestore batch writes to keep them under the
        hard-coded batch size limit.

        Takes a Firestore Client instance, exposes methods and properties
        that would result in batch "operations". Automatically flushes the
        batch when it's full to prevent overflows.
    """
    # this limit is imposed by firestore
    MAX_BATCH_SIZE = 500

    def __init__(self, client):
        # a single "write" can trigger additional operations (in effect,
        # incrementing the batch size by >1); track them here to anticipate
        # and prevent overflows
        self.pending_ops_count = 0
        self.client = client
        self._start_batch()

    def _track_write(self):
        self.batch_size += 1
        self.batch_size += self.pending_ops_count
        self.pending_ops_count = 0

    def _start_batch(self):
        self.batch_size = 0
        self.batch = self.client.batch()


    def _prevent_overflow(self):
        if self.batch_size + self.pending_ops_count >= self.MAX_BATCH_SIZE:
            self.commit()
            self._start_batch()

    @property
    def SERVER_TIMESTAMP(self):
       self.pending_ops_count += 1
       return firestore.SERVER_TIMESTAMP

    def commit(self):
        return self.batch.commit()

    # NOTE: can also mirror create, delete, update methods on batch as needed
    def set(self, *args, **kwargs):
        self._prevent_overflow()
        self.batch.set(*args, **kwargs)
        self._track_write()


def create_or_update_facilities(file_location):
    batch = FirestoreBatch(fs_client)

    with open(file_location, newline='') as f:
        reader = csv.DictReader(f)

        for row in reader:
            id = row['facility_id']

            facility_doc_ref = facilities_collection.document(id)
            facility_metadata = {}

            # are we updating or creating?
            fdoc_snapshot = facility_doc_ref.get()
            if fdoc_snapshot.exists:
                facility_metadata.update(fdoc_snapshot.to_dict())
            else:
                facility_metadata.update({
                    "createdAt": batch.SERVER_TIMESTAMP,
                })

            facility_metadata.update({
                "canonicalName": row['facility_name'],
                "stateName": row['state'],
                "facilityType": FACILITY_TYPE_MAPPING.get(row['facility_type'],
                                                          row['facility_type']),
            })

            if row['capacity']:
                facility_metadata["capacity"] = int(row["capacity"])

            if row['county'] and row['county'] != 'Not found':
                facility_metadata["county"] = re.sub(
                    r' County$',  '', row['county'])

            if row['population_year_updated'] and row['population']:
                latest_population = {
                    "date": datetime(int(row["population_year_updated"]), 1, 1, tzinfo=timezone.utc),
                    "value": int(row["population"]),
                }
                # we have to be a bit careful not to obliterate existing data in the population array;
                # generally this means looking for the item that corresponds to our input
                # and leaving any other items untouched
                if 'population' in facility_metadata:
                    # try to find an existing record matching this date
                    # (we only care about the year since that's all we have in the data source)
                    matching_record = next(
                        (r for r in facility_metadata['population']
                            if r['date'].year == latest_population['date'].year),
                        None)
                    # append or update accordingly
                    if matching_record is None:
                        facility_metadata['population'].append(
                            latest_population)
                    else:
                        matching_record['value'] = latest_population['value']
                else:
                    facility_metadata['population'] = [latest_population]

            batch.set(facility_doc_ref, facility_metadata)

    # one last commit for the last partially full batch
    batch.commit()


def build_covid_case_counts(row):
    covid_case_counts = {
        'popDeaths': row['pop_deaths'],
        'popTested': row['pop_tested'],
        'popTestedNegative': row['pop_tested_negative'],
        'popTestedPositive': row['pop_tested_positive'],
        'staffDeaths': row['staff_deaths'],
        'staffTested': row['staff_tested'],
        'staffTestedNegative': row['staff_tested_negative'],
        'staffTestedPositive': row['staff_tested_positive'],
    }

    # Remove empty strings and convert non-empty strings to integers
    return {k: int(v) for k, v in covid_case_counts.items() if v}


def download_from_cloud_storage(bucket_name, file_name):
    storage_client = storage.Client()
    blob = storage_client.get_bucket(bucket_name).get_blob(file_name)

    download_location = f'/tmp/{file_name}'

    blob.download_to_filename(download_location)

    return download_location


def reshape_facilities_data(file_location):
    """
    This function reshapes the daily Covid case data provided in CSV format into a
    dictionary structure that: 1) Removes repetitive and unwanted data and 2) Aligns
    with how we ultimately persist our documents within Firestore.

    For example, the following CSV:

    facility_id,date,pop_tested,pop_tested_negative,pop_tested_positive,pop_deaths,...etc
    510,2020-04-30,,,7,0,,,0,0
    510,2020-05-04,,,8,0,,,0,0
    516,2020-04-07,,,0,,,,0,
    516,2020-04-08,,,0,,,,0,
    ...

    ... would be aggregated by facility ID:

    {
      510: {
        "2020-04-30": {
            "popDeaths": 0,
            "staffTestedPositive": 0,
            "staffDeaths": 0,
            "popTestedPositive": 7
        },
        "2020-05-04": {
            "popDeaths": 0,
            "staffTestedPositive": 0,
            "staffDeaths": 0,
            "popTestedPositive": 8
        },
      },
      516: {
          "2020-04-07": {
              "popTestedPositive": 0,
              "staffTestedPositive": 0,
          },
          "2020-04-08": {
              "popTestedPositive": 0,
              "staffTestedPositive": 0,
          },
      },
      ...
    }
    """
    cases_by_facility = defaultdict(dict)

    with open(file_location, newline="") as csv_file:
        reader = csv.DictReader(csv_file, delimiter=',')

        for row in reader:
            key = row['facility_id']
            date = row['date']
            cases_by_facility[key][date] = build_covid_case_counts(row)

    return cases_by_facility


def save_case_data(facilities):
    found = 0
    not_found = 0
    for facility_id, covid_cases in facilities.items():

        facility_ref = facilities_collection.document(facility_id)

        # facility documents need to be created with the necessary metadata
        # (which is done via a separate function) before we can populate them
        # with daily case data
        if facility_ref.get().exists:
            found += 1
            batch = FirestoreBatch(fs_client)

            for date, cases in covid_cases.items():
                covidCasesOnDateRef = facility_ref.collection(
                    'covidCases').document(date)
                # overwrite any existing documents; if source has changed,
                # we will assume it is both correct and exhaustive
                batch.set(covidCasesOnDateRef, cases)
            batch.commit()
        else:
            not_found += 1
            print(f'facility {facility_id} does not exist')
    print(f'found: {found} not_found: {not_found}')


def ingest_daily_covid_case_data(bucket_name, file_name):
    file_location = download_from_cloud_storage(bucket_name, file_name)
    facilities = reshape_facilities_data(file_location)
    save_case_data(facilities)


def ingest_facility_metadata_file(bucket_name, file_name):
    file_location = download_from_cloud_storage(bucket_name, file_name)
    create_or_update_facilities(file_location)


if __name__ == "__main__":
    # create_or_update_facilities('./bq-metadata.csv')
    facilities = reshape_facilities_data('./bq-daily-data.csv')
    save_case_data(facilities)

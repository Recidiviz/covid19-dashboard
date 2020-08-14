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
        'popDeaths': row['Pop Deaths'],
        'popTested': row['Pop Tested'],
        'popTestedNegative': row['Pop Tested Negative'],
        'popTestedPositive': row['Pop Tested Positive'],
        'staffDeaths': row['Staff Deaths'],
        'staffTested': row['Staff Tested'],
        'staffTestedNegative': row['Staff Tested Negative'],
        'staffTestedPositive': row['Staff Tested Positive'],
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

    Date,Facility Type,State,Canonical Facility Name,Pop Tested,Pop Tested Positive, etc.
    2020-06-01,State Prisons,Colorado,Denver Reception & Diagnostic Center,253,2,,0,,,,,,,
    2020-06-02,State Prisons,Colorado,Denver Reception & Diagnostic Center,253,2,,0,,,,,,,
    2020-06-03,State Prisons,Colorado,Denver Reception & Diagnostic Center,253,2,,0,,,,,,,
    2020-06-04,State Prisons,Colorado,Denver Reception & Diagnostic Center,253,2,,0,,,,,,,

    Would be reshaped to:

    {
      "Colorado::Denver Reception & Diagnostic Center": {
        "canonicalName": "Denver Reception & Diagnostic Center",
        "facilityType": "State Prisons",
        "stateName": "Colorado",
        "covidCases": {
          "2020-06-01": {
            "popDeaths": 0,
            "popTested": 253,
            "popTestedPositive": 2
          },
          "2020-06-02": {
            "popDeaths": 0,
            "popTested": 253,
            "popTestedPositive": 2
          },
          "2020-06-03": {
            "popDeaths": 0,
            "popTested": 253,
            "popTestedPositive": 2
          },
          "2020-06-04": {
            "popDeaths": 0,
            "popTested": 253,
            "popTestedPositive": 2
          }
        }
      },
      ...
    }
    """
    facilities = {}
    with open(file_location) as csv_file:
        reader = csv.DictReader(csv_file, delimiter=',')

        for row in reader:
            state_name = row["State"].strip()
            canonical_facility_name = row["Canonical Facility Name"].strip()
            facility_type = row['Facility Type'].strip()
            date = row['Date'].strip()

            key = f'{state_name}::{canonical_facility_name}'

            if (key in facilities):
                # If the facility already exists, append the case counts for a given day.
                facilities[key]['covidCases'][date] = build_covid_case_counts(
                    row)
            else:
                # If the facility does not already exist, save its metadata along with
                # the case counts for a given day.
                facilities[key] = {
                    'canonicalName': canonical_facility_name,
                    'facilityType': facility_type,
                    'stateName': state_name,
                    'covidCases': {
                        f'{date}': build_covid_case_counts(row)
                    }
                }

    return facilities


def persist(facilities):
    for _key, facility in facilities.items():
        state_name = facility["stateName"]
        facility_name = facility["canonicalName"]

        facilitiesQueryResult = facilities_collection \
            .where('stateName', '==', f'{state_name}') \
            .where('canonicalName', '==', f'{facility_name}') \
            .stream()

        facilityDocuments = list(facilitiesQueryResult)

        if len(facilityDocuments) <= 1:
            # If a reference facility already exists we will set facility_id to the existing
            # reference facility's id in order to perform an update on that reference
            # facility.  Otherwise, we will set the facility_id to None which signals to
            # Firestore to create a new reference facility document.
            existing_reference_facility = len(facilityDocuments) == 1
            facility_id = facilityDocuments[0].id if existing_reference_facility else None
            facility_ref = facilities_collection.document(facility_id)

            # For new reference facility documents, set a createdAt timestamp.  This allows
            # us to know which reference facilities are "new" from the perspective of a given
            # user.
            if not existing_reference_facility:
                facility['createdAt'] = firestore.SERVER_TIMESTAMP

            # Remove the Covid case data so that it can be stored separately in its own
            # sub-collection.
            covid_cases = facility.pop('covidCases')

            batch = fs_client.batch()

            batch.set(facility_ref, facility, merge=True)

            for date, cases in covid_cases.items():
                covidCasesOnDateRef = facility_ref.collection(
                    'covidCases').document(date)
                batch.set(covidCasesOnDateRef, cases)

            batch.commit()
        else:
            log.error(
                f'Multiple Documents were returned for {facility_name} in {state_name}')


def ingest_daily_covid_case_data(bucket_name, file_name):
    file_location = download_from_cloud_storage(bucket_name, file_name)
    facilities = reshape_facilities_data(file_location)
    persist(facilities)


def ingest_facility_metadata_file(bucket_name, file_name):
    file_location = download_from_cloud_storage(bucket_name, file_name)
    create_or_update_facilities(file_location)

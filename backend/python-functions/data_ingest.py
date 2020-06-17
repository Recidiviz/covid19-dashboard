import csv
from google.cloud import firestore
from google.cloud import storage
import logging

REFERENCE_FACILITIES_COLLECTION_ID = 'reference_facilities'

log = logging.getLogger("cloudLogger")

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

def download_covid_case_data(bucket_name, file_name):
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
                facilities[key]['covidCases'][date] = build_covid_case_counts(row)
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
    db = firestore.Client()

    facilities_collection = db.collection(REFERENCE_FACILITIES_COLLECTION_ID)
                
    for _key, facility in facilities.items():
        state_name = facility["stateName"]
        facility_name = facility["canonicalName"]

        facilitiesQueryResult = facilities_collection \
            .where('stateName', '==', f'{state_name}') \
            .where('canonicalName', '==', f'{facility_name}') \
            .stream()

        facilityDocuments = list(facilitiesQueryResult)       

        if len(facilityDocuments) <= 1:
            # Accesses an existing reference facility document or creates a new one if
            # one does not exist.
            facility_id = facilityDocuments[0].id if len(facilityDocuments) == 1 else None
            facility_ref = facilities_collection.document(facility_id)
            
            # Remove the Covid case data so that it can be stored separately in its own
            # sub-collection.
            covid_cases = facility.pop('covidCases')
            
            batch = db.batch()
            
            batch.set(facility_ref, facility)    

            for date, cases in covid_cases.items():
                covidCasesOnDateRef = facility_ref.collection('covidCases').document(date)
                batch.set(covidCasesOnDateRef, cases)
            
            batch.commit()
        else:
            log.error(f'Multiple Documents were returned for {facility_name} in {state_name}')

def ingest_daily_covid_case_data(bucket_name, file_name):
    file_location = download_covid_case_data(bucket_name, file_name)
    facilities = reshape_facilities_data(file_location)
    persist(facilities)

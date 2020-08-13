from collections import defaultdict

from helpers import cloudfunction
from schemas import rt_input, rt_output
from realtime_rt import compute_r_t
from data_ingest import ingest_daily_covid_case_data, ingest_facility_metadata_file

@cloudfunction(
    in_schema=rt_input,
    out_schema=rt_output,
)
def calculate_rt(request_json):
    """
        accepts an object deserialized from JSON.
        returns an object that can be serialized to JSON.
        see schemas in @cloudfunction decorator for details.
    """
    resp = defaultdict(list)

    result_df = compute_r_t(request_json)

    for day in result_df.index:
        date_str = day.strftime("%Y-%m-%d")
        resp['Rt'].append({'date': date_str, 'value': result_df.loc[day, 'ML']})
        resp['low90'].append({'date': date_str, 'value': result_df.loc[day, 'Low_90']})
        resp['high90'].append({'date': date_str, 'value': result_df.loc[day, 'High_90']})

    return resp

def ingest_covid_case_data(event, _context):
    """
        Ingests Covid case data. This function is triggered when a new
        CSV file containing daily Covid case data is placed into the
        c19-backend-covid-case-data bucket.
    """
    ingest_daily_covid_case_data(event['bucket'], event['name'])


def ingest_facility_metadata(event, _context):
    """
        Ingests facility metadata. This function is triggered when a new
        CSV file containing facility metadata is placed into the
        c19-backend-facility-metadata bucket.
    """
    ingest_facility_metadata_file(event['bucket'], event['name'])

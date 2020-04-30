from collections import defaultdict
from flask import json

from helpers import cloudfunction
from schemas import rt_input, rt_output
from realtime_rt import compute_r_t

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

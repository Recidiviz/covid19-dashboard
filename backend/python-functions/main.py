from collections import defaultdict
from flask import json

from helpers import cloudfunction
from schemas import rt_input, rt_output

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

    # TODO: real calculation
    for date in request_json['dates']:
        resp['Rt'].append({'date': date, 'value': 1.8})
        resp['low90'].append({'date': date, 'value': 0.6})
        resp['high90'].append({'date': date, 'value': 3.7})

    return resp

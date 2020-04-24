from collections import defaultdict
from flask import json

def calculate_rt(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request):
            Expected JSON body:
            {
                "dates":[<(timestamp in s)>, ...],
                "cases": [<number>, ...]
            }

    Returns:
        JSON:
            {
                "Rt": [
                    {"date": <timestamp in s>, "value": <number>},
                    ...
                ],
                "high90": [
                    {"date": <timestamp in s>, "value": <number>},
                    ...
                ],
                "low90": [
                    {"date": <timestamp in s>, "value": <number>},
                    ...
                ],

            }
    """
    request_json = request.get_json(silent=True)
    resp = defaultdict(list)

    if request_json and 'dates' in request_json and 'cases' in request_json:
        # TODO: real calculation
        for date in request_json['dates']:
            resp['Rt'].append({'date': date, 'value': 1.8})
            resp['low90'].append({'date': date, 'value': 0.6})
            resp['high90'].append({'date': date, 'value': 3.7})

    return json.dumps(resp)

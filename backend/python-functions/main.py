from flask import jsonify

def calculate_rt(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request):
            Expected JSON body:
            {
                "dates":[<number (timestamp in s)>, ...],
                "cases": [<number>, ...]
            }

    Returns:
        a JsonResponse:
            {
                "rt": <number>
            }
    """
    request_json = request.get_json(silent=True)
    response_obj = {}

    # TODO: real calculation
    if request_json and 'dates' in request_json and 'cases' in request_json:
        response_obj['rt'] = 1.6

    return jsonify(response_obj)

# adapted from https://codereview.stackexchange.com/questions/217303/decorate-a-python-function-to-work-as-a-google-cloud-function
import functools
from flask import json
import traceback

import jsonschema


def cloudfunction(in_schema=None, out_schema=None):
    """
    :param in_schema: the schema for the input, or a falsy value if there is no input
    :param out_schema: the schema for the output, or a falsy value if there is no output
    :return: the cloudfunction wrapped function
    """
    # Both schemas must be valid according to jsonschema draft 7, if they are provided.
    if in_schema:
        jsonschema.Draft7Validator.check_schema(in_schema)
    if out_schema:
        jsonschema.Draft7Validator.check_schema(out_schema)

    def cloudfunction_decorator(f):
        """ Wraps a function with one argument, a json object that it expects to be sent with the request.
        It modifies it by setting CORS headers and responding to OPTIONS requests with `Allow-Origin *`

        :param f: A function that takes a `request` and returns a json-serializable object
        :return: a function that accepts one argument, a Flask request, and calls f with the modifications listed
        """

        @functools.wraps(f)
        def wrapped(request):
            if request.method == 'OPTIONS':
                return cors_options()

            # If it's not a CORS OPTIONS request, still include the base header.
            headers = {'Access-Control-Allow-Origin': '*'}

            try:
                if in_schema:
                    request_json = request.get_json()
                    jsonschema.validate(request_json, in_schema)
                    function_output = f(request_json)
                else:
                    function_output = f()

                if out_schema:
                    jsonschema.validate(function_output, out_schema)

                response_json = json.dumps(function_output)
                return (response_json, 200, headers)
            except:
                return (traceback.format_exc(), 500, headers)

        return wrapped

    return cloudfunction_decorator


# If given an OPTIONS request, tell the requester that we allow all CORS requests (pre-flight stage)
def cors_options():
    # Allows GET and POST requests from any origin with the Content-Type
    # header and caches preflight response for an 3600s
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }

    return ('', 204, headers)
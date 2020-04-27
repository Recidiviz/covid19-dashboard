from flask import json
from unittest import TestCase
from unittest.mock import Mock

from main import calculate_rt

class TestCalculateRt(TestCase):
    def setUp(self):
        self.req = Mock(get_json=Mock())

    def get_response_json(self):
        (response_body, _, _) = calculate_rt(self.req)
        return json.loads(response_body)

    def test_happy_path(self):
        data = {
        'dates': [1587422775, 1587509175, 1587595575, 1587681975],
        'cases': [5, 3, 0, 12]
        }
        self.req.get_json.return_value = data

        resp = self.get_response_json()

        # TODO: this is really just a placeholder test.
        # is 1:1 correspondence between input and output dates
        # actually what we want? probably not
        for date in data['dates']:
            rt = next(x for x in resp['Rt'] if x['date'] == date)
            self.assertIsInstance(rt['value'], float)

            rt = next(x for x in resp['low90'] if x['date'] == date)
            self.assertIsInstance(rt['value'], float)

            rt = next(x for x in resp['high90'] if x['date'] == date)
            self.assertIsInstance(rt['value'], float)


    def test_invalid_input(self):
        self.req.get_json.return_value = {}

        resp = self.get_response_json()

        self.assertIn('error', resp)

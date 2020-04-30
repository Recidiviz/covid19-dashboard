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
            'dates': ['2020-04-15', '2020-04-16', '2020-04-18', '2020-04-19'],
            'cases': [30, 50, 90, 150]
        }
        self.req.get_json.return_value = data

        resp = self.get_response_json()

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

    def test_empty_input(self):
        data = {
            'dates': [],
            'cases': []
        }
        self.req.get_json.return_value = data

        resp = self.get_response_json()
        self.assertIn('error', resp)

    def test_too_few_cases(self):
        data = {
        'dates': ['2020-04-15', '2020-04-16', '2020-04-18', '2020-04-19'],
        'cases': [5, 7, 15, 22]
        }
        self.req.get_json.return_value = data

        resp = self.get_response_json()
        self.assertIn('error', resp)

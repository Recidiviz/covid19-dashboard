from flask import json
import logging
from unittest import TestCase
from unittest.mock import Mock

from main import calculate_rt

logging.disable(logging.CRITICAL)

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

        # the earliest date should not be present in the response
        for metric in ['Rt', 'low90', 'high90']:
            self.assertEqual(len(resp[metric]), len(data['dates']) - 1)

            for date in data['dates'][1:]:
                rt = next(x for x in resp[metric] if x['date'] == date)
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

    def test_no_change_threshold(self):
        # even if there is little to no change day-over-day,
        # the function should accept the inputs
        # (this is a change, as there used to be a minimum threshold)
        data = {
        'dates': ['2020-04-15', '2020-04-16', '2020-04-18', '2020-04-19'],
        'cases': [5, 6, 6, 12]
        }
        self.req.get_json.return_value = data

        resp = self.get_response_json()
        self.assertNotIn('error', resp)

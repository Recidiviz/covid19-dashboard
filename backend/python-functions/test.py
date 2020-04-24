from flask import json
from unittest import TestCase
from unittest.mock import Mock

from main import calculate_rt

class TestCalculateRt(TestCase):
    def test_happy_path(self):
        data = {
        'dates': [1587422775, 1587509175, 1587595575, 1587681975],
        'cases': [5, 3, 0, 12]
        }
        req = Mock(get_json=Mock(return_value=data))

        resp = json.loads(calculate_rt(req))
        for date in data['dates']:
            rt = next(x for x in resp['Rt'] if x['date'] == date)
            self.assertIsInstance(rt['value'], float)

            rt = next(x for x in resp['low90'] if x['date'] == date)
            self.assertIsInstance(rt['value'], float)

            rt = next(x for x in resp['high90'] if x['date'] == date)
            self.assertIsInstance(rt['value'], float)


    def test_invalid_input(self):
        req = Mock(get_json=Mock(return_value={}))

        resp = json.loads(calculate_rt(req))
        self.assertEqual(resp, {})

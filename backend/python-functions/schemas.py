number_array = {
    "type": "array",
    "items": {
        "type": "number",
    },
}

rt_input = {
    "type": "object",
    "properties": {
        "dates": number_array,
        "cases": number_array,
    },
}

rt_records = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "date": {"type": "number"},
      "value": {"type": "number"},
    },
  },
}

rt_output = {
    "type": "object",
    "properties": {
        "Rt": rt_records,
        "low90": rt_records,
        "high90": rt_records,
    },
}
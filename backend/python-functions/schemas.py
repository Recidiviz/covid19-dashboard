number_array = {
    "type": "array",
    "items": {
        "type": "number",
    },
}

rt_input = {
    "type": "object",
    "properties": {
        "dates": {
            "type": "array",
            "items": {
                "type": "string",
                "format": "date",
            },
        },
        "cases": number_array,
    },
}

rt_records = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
        "date": {
            "type": "string",
            "format": "date",
        },
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
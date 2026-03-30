import pickle
import pandas as pd
import json

with open(r"c:\Users\Asus\Desktop\TezWebApp\backend\recipes_processed.pkl", "rb") as f:
    df = pickle.load(f)

with open(r"c:\Users\Asus\Desktop\TezWebApp\schema.json", "w") as f:
    # Convert first row to dict and dump
    # handle non-serializable like sets if any
    first_row = df.iloc[0].to_dict()
    def default_serializer(obj):
        if isinstance(obj, set):
            return list(obj)
        return str(obj)
    json.dump(first_row, f, default=default_serializer, indent=2)

with open(r"c:\Users\Asus\Desktop\TezWebApp\backend\mappings.pkl", "rb") as f:
    mappings = pickle.load(f)

with open(r"c:\Users\Asus\Desktop\TezWebApp\mappings_info.json", "w") as f:
    info = {
        "keys": list(mappings.keys()),
        "user_keys_sample": list(mappings.get('user', {}).keys())[:5],
        "item_keys_sample": list(mappings.get('item', {}).keys())[:5]
    }
    json.dump(info, f, indent=2)

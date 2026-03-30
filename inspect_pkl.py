import pickle

try:
    import pandas as pd
    with open(r"c:\Users\Asus\Desktop\TezWebApp\backend\recipes_processed.pkl", "rb") as f:
        data = pickle.load(f)
        if isinstance(data, pd.DataFrame):
            print("Columns:", data.columns.tolist())
            print("Row 1 dict:", data.iloc[0].to_dict())
        else:
            print("Type is:", type(data))
except ImportError as e:
    print("Failed to import pandas:", e)
except Exception as e:
    print("Error:", e)

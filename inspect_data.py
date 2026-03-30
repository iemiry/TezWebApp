import pandas as pd
import pickle

print("=== PP_recipes.csv ===")
try:
    df_recipes = pd.read_csv(r"c:\Users\Asus\Desktop\TezWebApp\database\PP_recipes.csv", nrows=5)
    print(df_recipes.columns.tolist())
    print(df_recipes.head(2))
except Exception as e:
    print("Error:", e)

print("\n=== mappings.pkl ===")
try:
    with open(r"c:\Users\Asus\Desktop\TezWebApp\backend\mappings.pkl", "rb") as f:
        mappings = pickle.load(f)
    print("Keys in mappings:", mappings.keys())
except Exception as e:
    print("Error:", e)

print("\n=== recipes_processed.pkl ===")
try:
    with open(r"c:\Users\Asus\Desktop\TezWebApp\backend\recipes_processed.pkl", "rb") as f:
        recipes_processed = pickle.load(f)
    if isinstance(recipes_processed, pd.DataFrame):
        print(recipes_processed.columns.tolist())
        print(recipes_processed.head(2))
    else:
        print("Type:", type(recipes_processed))
except Exception as e:
    print("Error:", e)

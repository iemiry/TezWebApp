import csv
import json

with open(r"c:\Users\Asus\Desktop\TezWebApp\database\PP_recipes.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    print("Headers:", next(reader))
    print("Row 1:", next(reader))

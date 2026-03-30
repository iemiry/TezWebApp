import pickle
import pandas as pd
import ast
from collections import Counter

path = "c:\\Users\\Asus\\Desktop\\TezWebApp\\backend\\recipes_processed.pkl"
with open(path, "rb") as f:
    df = pickle.load(f)

all_tags = []
for tags in df['tags']:
    if isinstance(tags, str):
        try:
            parsed = ast.literal_eval(tags)
            all_tags.extend(parsed)
        except:
            all_tags.append(tags)
    elif isinstance(tags, list):
        all_tags.extend([str(t) for t in tags])

counter = Counter(all_tags)
with open("counts.txt", "w", encoding="utf-8") as out:
    out.write("Top 20 most common tags:\n")
    for tag, c in counter.most_common(20):
        out.write(f"{tag}: {c}\n")

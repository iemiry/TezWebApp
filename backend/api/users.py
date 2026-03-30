from fastapi import APIRouter
import json
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "db.json")

def load_db():
    if not os.path.exists(DB_PATH):
        return {"favorites": {}}
    with open(DB_PATH, "r") as f:
        try:
            return json.load(f)
        except:
            return {"favorites": {}}

def save_db(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f)

@router.post("/{user_id}/favorites/{recipe_id}")
def toggle_favorite(user_id: str, recipe_id: str):
    db = load_db()
    user_favs = db["favorites"].setdefault(user_id, [])
    
    if recipe_id in user_favs:
        user_favs.remove(recipe_id)
        status = "removed"
    else:
        user_favs.append(recipe_id)
        status = "added"
        
    save_db(db)
    return {"status": status, "favorites": user_favs}

@router.get("/{user_id}/favorites")
def get_favorites(user_id: str):
    db = load_db()
    return db["favorites"].get(user_id, [])

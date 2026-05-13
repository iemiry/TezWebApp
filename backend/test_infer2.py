import sys
sys.path.append('.')
from api.routes import recommender
from core.database import SessionLocal
from models.user import Favorite

db = SessionLocal()
favs = [str(f.recipe_id) for f in db.query(Favorite).filter(Favorite.user_id==3).all()]
print(f"User 3 has {len(favs)} favorites: {favs}")
recipe_to_idx = {v: k for k, v in recommender.idx_to_recipe_id.items()}
fav_internal_ids = [recipe_to_idx[str(fid)] for fid in favs if str(fid) in recipe_to_idx]
print(f"Mapped internal IDs: {len(fav_internal_ids)}")

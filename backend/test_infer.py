import sys
sys.path.append('.')
from api.routes import recommender
from core.database import SessionLocal
from models.user import Favorite

db = SessionLocal()
favs = [str(f.recipe_id) for f in db.query(Favorite).filter(Favorite.user_id==3).all()]
print(f"User 3 has {len(favs)} favorites")
try:
    res = recommender.get_recommendations(3, 10, favs)
    print("Match percentages:")
    print([r.get('match_percentage') for r in res])
except Exception as e:
    import traceback
    traceback.print_exc()

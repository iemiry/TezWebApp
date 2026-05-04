from fastapi import APIRouter, HTTPException, Path, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from schemas.recipe import RecipeResponse, RecommendationResponse
from services.recommender import RecommenderService
from core.database import get_db
from models.user import Favorite, Rating, User
from core.security import get_current_user
from pydantic import BaseModel
import os

router = APIRouter()

# Initialize recommender service
# These paths are based on the uploaded directory structure
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "lightfm_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "recipes_processed.pkl")
MAPPINGS_PATH = os.path.join(BASE_DIR, "mappings.pkl")
INTERACTIONS_PATH = os.path.join(BASE_DIR, "interactions_matrix.npz")

recommender = RecommenderService(
    model_path=MODEL_PATH,
    dataset_path=DATASET_PATH,
    mappings_path=MAPPINGS_PATH,
    interactions_path=INTERACTIONS_PATH
)

from pydantic import BaseModel

class BulkRecipeRequest(BaseModel):
    recipe_ids: List[str]

class RatingRequest(BaseModel):
    score: int
    
class RatingResponse(BaseModel):
    average_rating: float
    total_reviews: int
    user_rating: Optional[int] = None

@router.get("/recipes", response_model=List[dict])
def get_recipes(limit: int = 10, category: Optional[str] = None, q: Optional[str] = None):
    return recommender.get_recipes(limit=limit, category=category, query=q)

@router.post("/recipes/bulk", response_model=List[dict])
def get_recipes_bulk(request: BulkRecipeRequest):
    return recommender.get_recipes_by_ids(request.recipe_ids)

@router.get("/recipes/random", response_model=dict)
def get_random_recipe(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    if user_id:
        fav_records = db.query(Favorite).filter(Favorite.user_id == user_id).all()
        fav_ids = [str(f.recipe_id) for f in fav_records]
        
        if len(fav_ids) >= 10:
            recs = recommender.get_recommendations(user_external_id=user_id, favorite_ids=fav_ids, num_items=50)
            if recs:
                import random
                return random.choice(recs)
                
    recipe = recommender.get_random_recipe()
    if not recipe:
        raise HTTPException(status_code=404, detail="No recipes available")
    return recipe

@router.get("/recipes/{recipe_id}", response_model=dict)
def get_recipe_by_id(recipe_id: str = Path(..., description="ID of the recipe")):
    """Get details of a specific recipe"""
    recipe = recommender.get_recipe(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.post("/recipes/{recipe_id}/rate")
def rate_recipe(
    request: RatingRequest, 
    recipe_id: str = Path(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if request.score < 1 or request.score > 5:
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5")

    rating = db.query(Rating).filter(Rating.user_id == current_user.id, Rating.recipe_id == recipe_id).first()
    if rating:
        rating.score = request.score
    else:
        new_rating = Rating(user_id=current_user.id, recipe_id=recipe_id, score=request.score)
        db.add(new_rating)
    
    db.commit()
    return {"status": "success", "score": request.score}

@router.get("/recipes/{recipe_id}/ratings", response_model=RatingResponse)
def get_recipe_ratings(
    recipe_id: str = Path(...), 
    user_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    # Base dataset rating simulation (random or from recipe)
    # Since we can't easily cross-read from the massive pkl in a lightweight endpoint safely every time, 
    # we'll look up the recipe directly
    recipe = recommender.get_recipe(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    dataset_rating = float(recipe.get("rating", 4.0))
    dataset_reviews = int(recipe.get("reviews", 10))
    
    # Custom Ratings
    custom_ratings = db.query(Rating.score).filter(Rating.recipe_id == recipe_id).all()
    custom_total = len(custom_ratings)
    custom_sum = sum(r[0] for r in custom_ratings)
    
    # Blended Rating
    blended_sum = (dataset_rating * dataset_reviews) + custom_sum
    blended_reviews = dataset_reviews + custom_total
    
    blended_average = blended_sum / blended_reviews if blended_reviews > 0 else 0
    
    user_rating = None
    if user_id:
        u_rating = db.query(Rating).filter(Rating.user_id == user_id, Rating.recipe_id == recipe_id).first()
        if u_rating:
            user_rating = u_rating.score
            
    return {
        "average_rating": round(blended_average, 1),
        "total_reviews": blended_reviews,
        "user_rating": user_rating
    }

@router.get("/recommendations/{user_id}", response_model=List[dict])
def get_recommendations(user_id: int = Path(..., description="The ID of the user"), db: Session = Depends(get_db)):
    """Get personalized recommendations strictly via LightFM Model Inference or Content-Based Cold Start"""
    # 1. Fetch User and Preferences
    user = db.query(User).filter(User.id == user_id).first()
    preferences = user.preferences.split(",") if user and user.preferences else []
    
    # 2. Check interaction threshold
    fav_records = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    fav_ids = [str(f.recipe_id) for f in fav_records]
    
    if len(fav_ids) < 10:
        # COLD START: Not enough interactions
        print(f"User {user_id} in COLD START (Favorites: {len(fav_ids)}/10)")
        if preferences:
            print(f"User {user_id} triggered Content-Based Cold Start with preferences: {preferences}")
            return recommender.get_recipes_by_preferences(preferences, 30)
        return recommender.get_popular_recipes(30)
        
    # EXCEEDED THRESHOLD: Pass items through Trained Model Latent Space
    print(f"User {user_id} triggered LightFM Inference (Favorites: {len(fav_ids)})!")
    recs = recommender.get_recommendations(user_external_id=user_id, favorite_ids=fav_ids, num_items=30)
    
    if not recs:
        return recommender.get_popular_recipes(30)
    return recs

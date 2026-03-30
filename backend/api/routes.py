from fastapi import APIRouter, HTTPException, Path
from typing import List, Optional
from schemas.recipe import RecipeResponse, RecommendationResponse
from services.recommender import RecommenderService
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

@router.get("/recipes", response_model=List[dict])
def get_recipes(limit: int = 10, category: Optional[str] = None, q: Optional[str] = None):
    return recommender.get_recipes(limit=limit, category=category, query=q)

@router.post("/recipes/bulk", response_model=List[dict])
def get_recipes_bulk(request: BulkRecipeRequest):
    return recommender.get_recipes_by_ids(request.recipe_ids)

@router.get("/recipes/random", response_model=dict)
def get_random_recipe():
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

@router.get("/recommendations/{user_id}", response_model=List[dict])
def get_recommendations(user_id: int = Path(..., description="The ID of the user")):
    """Get personalized recommendations using LightFM or Content-Based Fallback"""
    import json
    import os
    db_path = os.path.join(os.path.dirname(__file__), "db.json")
    favs = []
    try:
        if os.path.exists(db_path):
            with open(db_path, "r") as f:
                db = json.load(f)
                favs = db.get("users", {}).get(str(user_id), {}).get("favorites", [])
    except:
        pass

    recs = recommender.get_recommendations(user_external_id=user_id, num_items=10, favorite_ids=favs)
    if not recs:
        # If no recs (e.g., new user), fallback to popular
        recs = recommender.get_popular_recipes(10)
    return recs

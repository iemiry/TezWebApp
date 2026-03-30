from pydantic import BaseModel
from typing import List, Optional

class RecipeBase(BaseModel):
    id: str
    title: str
    description: str
    image: str
    prepTime: str
    difficulty: str
    rating: float
    reviews: int
    calories: int
    protein: str
    carbs: str
    category: str
    ingredients: List[str]
    steps: List[str]
    tags: List[str]

class RecipeResponse(RecipeBase):
    pass

class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[RecipeResponse]

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import Favorite, User
from core.security import get_current_user
from typing import List
from pydantic import BaseModel

class PreferencesRequest(BaseModel):
    preferences: List[str]

router = APIRouter()

@router.post("/{user_id}/favorites/{recipe_id}")
def toggle_favorite(user_id: int, recipe_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.recipe_id == recipe_id).first()
    
    if fav:
        db.delete(fav)
        db.commit()
        status_msg = "removed"
    else:
        new_fav = Favorite(user_id=user_id, recipe_id=recipe_id)
        db.add(new_fav)
        db.commit()
        status_msg = "added"
        
    current_favs = [f.recipe_id for f in db.query(Favorite).filter(Favorite.user_id == user_id).all()]
    return {"status": status_msg, "favorites": current_favs}

@router.get("/{user_id}/favorites", response_model=List[str])
def get_favorites(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
         raise HTTPException(status_code=403, detail="Yetkisiz işlem")
         
    favs = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    return [f.recipe_id for f in favs]

@router.post("/{user_id}/preferences")
def update_preferences(user_id: int, request: PreferencesRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    user.preferences = ",".join(request.preferences)
    db.commit()
    return {"status": "success", "preferences": request.preferences}

@router.get("/{user_id}/preferences", response_model=List[str])
def get_preferences(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    if not user.preferences:
        return []
        
    return user.preferences.split(",")


from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from core.security import verify_password, get_password_hash, create_access_token
from typing import Optional

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == request.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-posta adresi zaten kullanımda")
    
    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        name=request.name,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "user_id": user.id,
        "name": user.name,
        "token": token,
        "has_preferences": bool(user.preferences)
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz e-posta veya şifre")
    
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz e-posta veya şifre")
    
    token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "user_id": user.id,
        "token": token,
        "name": user.name,
        "bio": user.bio,
        "has_preferences": bool(user.preferences)
    }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    # Mocking successful login for any email with a dummy user_id=1
    if not request.email or not request.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    import hashlib
    # Deterministically hash the email into a unique integer so favorites remain completely isolated per user
    unique_user_id = int(hashlib.md5(request.email.lower().encode()).hexdigest(), 16) % 1000000000
    
    return {
        "user_id": unique_user_id,
        "token": f"fake-jwt-token-{unique_user_id}",
        "name": request.email.split("@")[0].capitalize()
    }

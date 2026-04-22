from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.auth import router as auth_router
from api.users import router as users_router
from core.database import engine, Base
import models.user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe Recommendation API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(users_router, prefix="/api/users")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
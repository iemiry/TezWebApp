from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tez Recipe Recommender"
    API_V1_STR: str = "/api"
    
    class Config:
        env_file = ".env"

settings = Settings()

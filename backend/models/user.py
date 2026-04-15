from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    bio = Column(String, default="Heirloom Kitchen şefi.")
    hashed_password = Column(String)
    preferences = Column(String, default="")
    
    favorites = relationship("Favorite", back_populates="user")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    recipe_id = Column(String, index=True)

    user = relationship("User", back_populates="favorites")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    recipe_id = Column(String, index=True)
    score = Column(Integer)  # 1 to 5

    user = relationship("User")

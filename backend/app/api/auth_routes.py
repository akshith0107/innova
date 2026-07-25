"""Authentication endpoints for user management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.database.connection import get_async_db
from app.repositories.user_repository import UserRepository
from app.utils.auth import (
    hash_password, verify_password, create_access_token, 
    decode_access_token, get_current_user
)
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response."""
    id: int
    email: str
    name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_async_db)):
    """Register a new user using UserRepository."""
    user_repo = UserRepository(db)
    existing_user = await user_repo.get_by_email(user_data.email)
    if existing_user:
        logger.warning(f"Registration attempt with existing email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed_password = hash_password(user_data.password)
    new_user = await user_repo.create_user(
        email=user_data.email,
        password_hash=hashed_password,
        name=user_data.name
    )
    
    logger.info(f"New user registered: {new_user.email}")
    
    token_data = {
        "user_id": new_user.id,
        "email": new_user.email
    }
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            created_at=new_user.created_at
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_async_db)):
    """Login a user using UserRepository."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(user_data.email)
    if not user:
        logger.warning(f"Login attempt with non-existent email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    password_hash = user.password_hash or (user.preferences.get("password_hash") if isinstance(user.preferences, dict) else None)
    if not password_hash or not verify_password(user_data.password, password_hash):
        logger.warning(f"Failed login attempt for user: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    logger.info(f"User logged in: {user.email}")
    
    token_data = {
        "user_id": user.id,
        "email": user.email
    }
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get current user information using UserRepository."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at
    )

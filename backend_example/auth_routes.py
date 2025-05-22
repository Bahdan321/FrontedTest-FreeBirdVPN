from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
import os
from uuid import uuid4

# Создаем роутер для авторизации
router = APIRouter(prefix="/auth", tags=["auth"])

# Схема данных для регистрации пользователя через Telegram
class TelegramUserRegister(BaseModel):
    telegram_id: int
    first_name: str
    last_name: str = ""
    username: str = ""
    language_code: str = "ru"
    photo_url: str = ""

# Схема данных для токенов
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"

# Схема данных для обновления токена
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Секретный ключ для JWT (в реальном приложении должен храниться в переменных окружения)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Хранилище пользователей (в реальном приложении это будет база данных)
users_db = {}
# Хранилище refresh токенов (в реальном приложении это будет база данных)
refresh_tokens_db = {}

# Функция для создания JWT токена
def create_jwt_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Функция для создания пары токенов (access и refresh)
def create_tokens(user_id: int):
    # Создаем access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_jwt_token(
        data={"sub": str(user_id)},
        expires_delta=access_token_expires
    )
    
    # Создаем refresh token
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = str(uuid4())
    
    # Сохраняем refresh token в базу данных
    refresh_tokens_db[refresh_token] = {
        "user_id": user_id,
        "expires": datetime.utcnow() + refresh_token_expires
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

# Маршрут для регистрации пользователя через Telegram
@router.post("/telegram/register", response_model=TokenResponse)
async def register_telegram_user(user_data: TelegramUserRegister):
    # Проверяем, существует ли пользователь с таким telegram_id
    user_id = user_data.telegram_id
    
    if str(user_id) not in users_db:
        # Если пользователь не существует, создаем его
        users_db[str(user_id)] = {
            "telegram_id": user_id,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "username": user_data.username,
            "language_code": user_data.language_code,
            "photo_url": user_data.photo_url,
            "created_at": datetime.utcnow()
        }
    
    # Создаем токены для пользователя
    tokens = create_tokens(user_id)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"]
    )

# Маршрут для обновления токена
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    refresh_token = request.refresh_token
    
    # Проверяем, существует ли refresh token
    if refresh_token not in refresh_tokens_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Проверяем, не истек ли срок действия refresh token
    token_data = refresh_tokens_db[refresh_token]
    if datetime.utcnow() > token_data["expires"]:
        # Удаляем истекший токен
        del refresh_tokens_db[refresh_token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    
    # Получаем user_id из refresh token
    user_id = token_data["user_id"]
    
    # Удаляем старый refresh token
    del refresh_tokens_db[refresh_token]
    
    # Создаем новые токены
    tokens = create_tokens(user_id)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"]
    )
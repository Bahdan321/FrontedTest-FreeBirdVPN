from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional, Dict, Any
import jwt
from datetime import datetime, timedelta
import os

# Создаем роутер для подписок
router = APIRouter(prefix="/subscription", tags=["subscription"])

# Настройка OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Секретный ключ для JWT (в реальном приложении должен храниться в переменных окружения)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"


# Схема данных для информации о подписке
class SubscriptionInfo(BaseModel):
    plan: str
    status: str
    dataUsage: str
    expiryDate: str
    isExpired: bool
    devices: int
    countries: int


# Хранилище подписок (в реальном приложении это будет база данных)
subscriptions_db = {}


# Функция для получения текущего пользователя из токена
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Декодируем JWT токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    return {"user_id": user_id}


# Инициализация тестовых данных
def init_test_data():
    # Добавляем тестовую подписку для пользователя с ID 12345678 (тестовый пользователь)
    subscriptions_db["12345678"] = {
        "plan": "FreeBirdVPN",
        "status": "online",
        "dataUsage": "153 Мб",
        "expiryDate": "3 мая 2025",
        "isExpired": False,
        "devices": 3,
        "countries": 65,
    }


# Инициализируем тестовые данные
init_test_data()


# Маршрут для получения информации о подписке
@router.get("/info", response_model=SubscriptionInfo)
async def get_subscription_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # Проверяем, есть ли информация о подписке для данного пользователя
    if user_id not in subscriptions_db:
        # Если информации нет, создаем базовую подписку
        subscriptions_db[user_id] = {
            "plan": "FreeBirdVPN",
            "status": "offline",
            "dataUsage": "0 Мб",
            "expiryDate": "3 мая 2025",
            "isExpired": True,
            "devices": 1,
            "countries": 65,
        }

    return SubscriptionInfo(**subscriptions_db[user_id])


# Маршрут для обновления статуса подписки
@router.post("/update-status")
async def update_subscription_status(
    status: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # Проверяем, есть ли информация о подписке для данного пользователя
    if user_id not in subscriptions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found"
        )

    # Обновляем статус подписки
    subscriptions_db[user_id]["status"] = status

    return {"message": "Subscription status updated successfully"}


# Маршрут для обновления использования данных
@router.post("/update-data-usage")
async def update_data_usage(
    data_usage: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # Проверяем, есть ли информация о подписке для данного пользователя
    if user_id not in subscriptions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found"
        )

    # Обновляем использование данных
    subscriptions_db[user_id]["dataUsage"] = data_usage

    return {"message": "Data usage updated successfully"}

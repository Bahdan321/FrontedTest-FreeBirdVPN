from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Импортируем созданные маршруты
from auth_routes import router as auth_router
from subscription_routes import router as subscription_router

# Создаем экземпляр FastAPI приложения
app = FastAPI(title="FreeBirdVPN API")

# Настраиваем CORS для взаимодействия с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене следует указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршруты
app.include_router(auth_router)
app.include_router(subscription_router)


# Корневой маршрут для проверки работоспособности API
@app.get("/")
async def root():
    return {"message": "FreeBirdVPN API работает!"}


# Запуск приложения (для локальной разработки)
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

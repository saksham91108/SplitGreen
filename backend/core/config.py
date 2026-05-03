from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SplitGreen"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    APP_URL: str = "http://localhost:5173"
    FRONTEND_URL: str = "http://localhost:5173"

    # MongoDB
    MONGO_URL: str = "mongodb+srv://settleadmin:testobject4321@expensesplit.gymueqy.mongodb.net/?appName=ExpenseSplit"
    MONGO_DB: str = "splitgreen"

    # JWT
    JWT_SECRET: str = "change-this-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    JWT_REMEMBER_EXPIRE_DAYS: int = 30

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    MAIL_FROM: str = ""
    MAIL_FROM_NAME: str = "SplitGreen"

    # Groq
    GROQ_API_KEY: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

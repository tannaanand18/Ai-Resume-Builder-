import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    # SSL for Aiven - works on both Windows and Render/Linux
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl_disabled": False
        },
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwtsecret")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_SAMESITE = "None"
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"

    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"

    CORS_HEADERS = "Content-Type"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://resumebuilder-kappa-nine.vercel.app")

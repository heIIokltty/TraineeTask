from functools import lru_cache
from os import getenv

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "KAIROS API"
    frontend_url: str = "http://localhost:5173"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    jwt_secret: str = ""


@lru_cache
def get_settings() -> Settings:
    defaults = Settings()

    return Settings(
        frontend_url=getenv("FRONTEND_URL", defaults.frontend_url),
        google_client_id=getenv("GOOGLE_CLIENT_ID", defaults.google_client_id),
        google_client_secret=getenv("GOOGLE_CLIENT_SECRET", defaults.google_client_secret),
        google_redirect_uri=getenv("GOOGLE_REDIRECT_URI", defaults.google_redirect_uri),
        jwt_secret=getenv("JWT_SECRET", defaults.jwt_secret),
    )

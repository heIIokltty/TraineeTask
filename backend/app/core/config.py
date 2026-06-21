from functools import lru_cache
from os import environ, getenv
from pathlib import Path

from pydantic import BaseModel

DEFAULT_BACKEND_CALLBACK_PATH = "/api/auth/google/callback"


class Settings(BaseModel):
    app_name: str = "KAIROS API"
    frontend_url: str = ""
    backend_public_url: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""
    jwt_secret: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return split_csv(self.frontend_url)

    @property
    def oauth_redirect_uri(self) -> str:
        if self.google_redirect_uri:
            return self.google_redirect_uri

        if not self.backend_public_url:
            return ""

        return f"{self.backend_public_url.rstrip('/')}{DEFAULT_BACKEND_CALLBACK_PATH}"


@lru_cache
def get_settings() -> Settings:
    load_env_file()

    return Settings(
        frontend_url=normalize_csv_urls(getenv("FRONTEND_URL", "")),
        backend_public_url=normalize_url(getenv("BACKEND_PUBLIC_URL", "")),
        google_client_id=getenv("GOOGLE_CLIENT_ID", ""),
        google_client_secret=getenv("GOOGLE_CLIENT_SECRET", ""),
        google_redirect_uri=normalize_url(getenv("GOOGLE_REDIRECT_URI", "")),
        jwt_secret=getenv("JWT_SECRET", ""),
    )


def load_env_file() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in environ:
            environ[key] = value


def normalize_csv_urls(value: str) -> str:
    return ",".join(normalize_url(item) for item in split_csv(value) if normalize_url(item))


def split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def normalize_url(value: str) -> str:
    return value.strip().rstrip("/")

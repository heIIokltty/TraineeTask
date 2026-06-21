import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from app.core.exceptions import AuthenticationError, ConfigurationError
from app.domain.user import User

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_SECONDS = 60 * 60
OAUTH_STATE_TTL_SECONDS = 10 * 60


def create_access_token(user: User, secret: str) -> str:
    payload = {
        "typ": "access",
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "exp": int(time.time()) + ACCESS_TOKEN_TTL_SECONDS,
    }

    return encode_jwt(payload, secret)


def create_oauth_state(secret: str, account_type: str) -> str:
    payload = {
        "typ": "oauth_state",
        "account_type": account_type,
        "jti": secrets.token_urlsafe(24),
        "exp": int(time.time()) + OAUTH_STATE_TTL_SECONDS,
    }

    return encode_jwt(payload, secret)


def verify_oauth_state(token: str, secret: str) -> dict[str, Any]:
    payload = decode_jwt(token, secret)

    if payload.get("typ") != "oauth_state":
        raise AuthenticationError("Invalid OAuth state.")

    return payload


def decode_access_token(token: str, secret: str) -> User:
    payload = decode_jwt(token, secret)

    if payload.get("typ") != "access":
        raise AuthenticationError("Invalid access token.")

    return User(
        email=str(payload.get("email", "")),
        name=str(payload.get("name", "")),
        picture=payload.get("picture"),
    )


def encode_jwt(payload: dict[str, Any], secret: str) -> str:
    if not secret:
        raise ConfigurationError("JWT_SECRET is required.")

    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    signing_input = ".".join(
        [
            base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8")),
            base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
        ],
    )
    signature = sign(signing_input, secret)

    return f"{signing_input}.{signature}"


def decode_jwt(token: str, secret: str) -> dict[str, Any]:
    if not secret:
        raise ConfigurationError("JWT_SECRET is required.")

    parts = token.split(".")
    if len(parts) != 3:
        raise AuthenticationError("Invalid token format.")

    signing_input = ".".join(parts[:2])
    expected_signature = sign(signing_input, secret)
    if not hmac.compare_digest(parts[2], expected_signature):
        raise AuthenticationError("Invalid token signature.")

    payload = json.loads(base64url_decode(parts[1]))
    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or expires_at < int(time.time()):
        raise AuthenticationError("Token expired.")

    return payload


def sign(signing_input: str, secret: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"),
        signing_input.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    return base64url_encode(digest)


def base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def base64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")

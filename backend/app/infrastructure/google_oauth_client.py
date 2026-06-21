import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import Settings
from app.core.exceptions import AuthenticationError, ConfigurationError
from app.domain.user import User

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_OAUTH_SCOPES = ("openid", "email", "profile")
HTTP_TIMEOUT_SECONDS = 10


class GoogleOAuthClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def build_authorization_url(self, state: str) -> str:
        self._ensure_configured()
        query = urlencode(
            {
                "client_id": self._settings.google_client_id,
                "redirect_uri": self._settings.oauth_redirect_uri,
                "response_type": "code",
                "scope": " ".join(GOOGLE_OAUTH_SCOPES),
                "state": state,
                "access_type": "online",
                "prompt": "select_account",
            },
        )

        return f"{GOOGLE_AUTH_URL}?{query}"

    def fetch_user(self, code: str) -> User:
        self._ensure_configured()
        token_payload = self._exchange_code(code)
        access_token = token_payload.get("access_token")

        if not isinstance(access_token, str):
            raise AuthenticationError("Google did not return an access token.")

        userinfo = self._fetch_userinfo(access_token)
        email = userinfo.get("email")

        if not isinstance(email, str) or not email:
            raise AuthenticationError("Google user email is missing.")

        return User(
            email=email,
            name=str(userinfo.get("name") or email),
            picture=userinfo.get("picture") if isinstance(userinfo.get("picture"), str) else None,
        )

    def _exchange_code(self, code: str) -> dict[str, Any]:
        body = urlencode(
            {
                "client_id": self._settings.google_client_id,
                "client_secret": self._settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self._settings.oauth_redirect_uri,
            },
        ).encode("utf-8")
        request = Request(
            GOOGLE_TOKEN_URL,
            data=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )

        return self._request_json(request)

    def _fetch_userinfo(self, access_token: str) -> dict[str, Any]:
        request = Request(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            method="GET",
        )

        return self._request_json(request)

    def _request_json(self, request: Request) -> dict[str, Any]:
        try:
            with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
                payload = response.read().decode("utf-8")
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise AuthenticationError(f"Google OAuth request failed: {detail}") from error
        except URLError as error:
            raise AuthenticationError("Google OAuth request failed.") from error

        data = json.loads(payload)
        if not isinstance(data, dict):
            raise AuthenticationError("Google OAuth response is invalid.")

        return data

    def _ensure_configured(self) -> None:
        if (
            not self._settings.google_client_id
            or not self._settings.google_client_secret
            or not self._settings.oauth_redirect_uri
        ):
            raise ConfigurationError(
                "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI "
                "or BACKEND_PUBLIC_URL are required.",
            )

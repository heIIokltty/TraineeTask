from app.core.config import Settings
from app.core.security import (
    create_access_token,
    create_oauth_state,
    decode_access_token,
    verify_oauth_state,
)
from app.domain.user import User
from app.infrastructure.google_oauth_client import GoogleOAuthClient


class StartGoogleOAuthUseCase:
    def __init__(self, google_oauth_client: GoogleOAuthClient, settings: Settings) -> None:
        self._google_oauth_client = google_oauth_client
        self._settings = settings

    def execute(self) -> str:
        state = create_oauth_state(self._settings.jwt_secret)

        return self._google_oauth_client.build_authorization_url(state)


class CompleteGoogleOAuthUseCase:
    def __init__(self, google_oauth_client: GoogleOAuthClient, settings: Settings) -> None:
        self._google_oauth_client = google_oauth_client
        self._settings = settings

    def execute(self, code: str, state: str) -> str:
        verify_oauth_state(state, self._settings.jwt_secret)
        user = self._google_oauth_client.fetch_user(code)

        return create_access_token(user, self._settings.jwt_secret)


class GetCurrentUserUseCase:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def execute(self, token: str) -> User:
        return decode_access_token(token, self._settings.jwt_secret)

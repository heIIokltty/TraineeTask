from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import RedirectResponse

from app.application.auth_use_cases import (
    CompleteGoogleOAuthUseCase,
    GetCurrentUserUseCase,
    StartGoogleOAuthUseCase,
)
from app.core.config import Settings, get_settings
from app.core.exceptions import AppError, AuthenticationError
from app.infrastructure.google_oauth_client import GoogleOAuthClient
from app.presentation.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google/start")
def start_google_oauth(settings: Annotated[Settings, Depends(get_settings)]) -> RedirectResponse:
    use_case = StartGoogleOAuthUseCase(GoogleOAuthClient(settings), settings)

    try:
        authorization_url = use_case.execute()
    except AppError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error.message,
        ) from error

    return RedirectResponse(authorization_url, status_code=status.HTTP_303_SEE_OTHER)


@router.get("/google/callback")
def complete_google_oauth(
    code: str,
    state: str,
    settings: Annotated[Settings, Depends(get_settings)],
) -> RedirectResponse:
    use_case = CompleteGoogleOAuthUseCase(GoogleOAuthClient(settings), settings)

    try:
        token = use_case.execute(code=code, state=state)
    except AuthenticationError as error:
        redirect_url = build_frontend_auth_error_url(settings.frontend_url, error.message)
        return RedirectResponse(redirect_url, status_code=status.HTTP_303_SEE_OTHER)
    except AppError as error:
        redirect_url = build_frontend_auth_error_url(settings.frontend_url, error.message)
        return RedirectResponse(redirect_url, status_code=status.HTTP_303_SEE_OTHER)

    redirect_url = build_frontend_auth_callback_url(settings.frontend_url, token)

    return RedirectResponse(redirect_url, status_code=status.HTTP_303_SEE_OTHER)


@router.get("/me", response_model=UserResponse)
def get_current_user(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> UserResponse:
    token = extract_bearer_token(authorization)
    use_case = GetCurrentUserUseCase(settings)

    try:
        user = use_case.execute(token)
    except AuthenticationError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error.message,
        ) from error
    except AppError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error.message,
        ) from error

    return UserResponse(email=user.email, name=user.name, picture=user.picture)


def build_frontend_auth_callback_url(frontend_url: str, token: str) -> str:
    return f"{frontend_url.rstrip('/')}/auth/callback#token={quote(token)}"


def build_frontend_auth_error_url(frontend_url: str, message: str) -> str:
    return f"{frontend_url.rstrip('/')}/auth/callback?error={quote(message)}"


def extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required.",
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token is required.",
        )

    return token

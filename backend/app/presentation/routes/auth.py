import logging
from typing import Annotated
from urllib.parse import quote, urlsplit

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
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
logger = logging.getLogger("kairos.auth")
VALID_ACCOUNT_TYPES = {"personal", "business"}


@router.get("/google/start")
def start_google_oauth(
    settings: Annotated[Settings, Depends(get_settings)],
    account_type: Annotated[str, Query(alias="accountType")] = "personal",
) -> RedirectResponse:
    normalized_account_type = normalize_account_type(account_type)
    use_case = StartGoogleOAuthUseCase(GoogleOAuthClient(settings), settings)

    try:
        authorization_url = use_case.execute(normalized_account_type)
    except AppError as error:
        logger.exception("oauth.start.failed account_type=%s", normalized_account_type)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error.message,
        ) from error

    logger.info(
        "oauth.start.redirect account_type=%s redirect_uri=%s google_host=%s frontend_url=%s",
        normalized_account_type,
        settings.oauth_redirect_uri,
        urlsplit(authorization_url).netloc,
        settings.frontend_url,
    )

    return RedirectResponse(authorization_url, status_code=status.HTTP_303_SEE_OTHER)


@router.get("/google/callback")
def complete_google_oauth(
    code: str,
    state: str,
    settings: Annotated[Settings, Depends(get_settings)],
) -> RedirectResponse:
    use_case = CompleteGoogleOAuthUseCase(GoogleOAuthClient(settings), settings)
    logger.info(
        "oauth.callback.received code_present=%s state_present=%s redirect_uri=%s",
        bool(code),
        bool(state),
        settings.oauth_redirect_uri,
    )

    try:
        token, user, account_type = use_case.execute(code=code, state=state)
    except AuthenticationError as error:
        logger.warning("oauth.callback.auth_failed error=%s", error.message)
        redirect_url = build_frontend_auth_error_url(settings.frontend_url, error.message)
        return RedirectResponse(redirect_url, status_code=status.HTTP_303_SEE_OTHER)
    except AppError as error:
        logger.exception("oauth.callback.failed")
        redirect_url = build_frontend_auth_error_url(settings.frontend_url, error.message)
        return RedirectResponse(redirect_url, status_code=status.HTTP_303_SEE_OTHER)

    redirect_url = build_frontend_auth_callback_url(settings.frontend_url, token)
    logger.info(
        "oauth.callback.success account_type=%s user_email_hash=%s token_created=%s frontend_redirect=%s",
        account_type,
        hash_log_value(user.email),
        bool(token),
        redact_frontend_redirect(redirect_url),
    )

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


def normalize_account_type(account_type: str) -> str:
    normalized_account_type = account_type.strip().lower()
    if normalized_account_type in VALID_ACCOUNT_TYPES:
        return normalized_account_type

    return "personal"


def hash_log_value(value: str) -> str:
    return str(abs(hash(value)) % 1_000_000)


def redact_frontend_redirect(redirect_url: str) -> str:
    parsed_url = urlsplit(redirect_url)
    return f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"


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

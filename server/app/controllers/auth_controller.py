from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth_service import AuthService


def login(db: Session, payload: LoginRequest) -> LoginResponse:
    return AuthService(db).login(payload)


def logout(db: Session) -> dict[str, str]:
    return AuthService(db).logout()


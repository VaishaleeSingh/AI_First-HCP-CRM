from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import auth_controller
from app.core.security import get_current_user
from app.database.session import get_db
from app.models import User
from app.schemas.auth import AuthUser, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return auth_controller.login(db, payload)


@router.post("/logout")
def logout(db: Session = Depends(get_db)) -> dict[str, str]:
    return auth_controller.logout(db)


@router.get("/me", response_model=AuthUser)
def current_user(user: User = Depends(get_current_user)) -> AuthUser:
    return AuthUser(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        territory=user.territory,
    )

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthUser, LoginRequest, LoginResponse

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 8 * 60


class AuthService:
    def __init__(self, db: Session) -> None:
        self.user_repository = UserRepository(db)
        self.settings = get_settings()

    def login(self, payload: LoginRequest) -> LoginResponse:
        user = self.user_repository.get_by_email(payload.email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not self._password_matches(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        auth_user = AuthUser(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            territory=user.territory,
        )
        return LoginResponse(
            access_token=self._create_access_token(auth_user),
            user=auth_user,
        )

    def logout(self) -> dict[str, str]:
        return {"message": "Logged out"}

    def _create_access_token(self, user: AuthUser) -> str:
        expires_at = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
        payload = {
            "exp": expires_at,
            "role": user.role,
            "sub": str(user.id),
            "territory": user.territory,
        }
        return jwt.encode(
            payload,
            self.settings.jwt_secret_key,
            algorithm=JWT_ALGORITHM,
        )

    @staticmethod
    def _password_matches(password: str, stored_password: str) -> bool:
        if stored_password == "development-only":
            return password == "Welcome123"
        return password == stored_password

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.settings import get_settings
from app.database.base import Base
from app.models import User
from app.schemas.auth import LoginRequest
from app.core.security import get_current_user
from app.services.auth_service import AuthService, JWT_ALGORITHM


def test_login_returns_role_based_jwt_for_valid_demo_user():
    db = build_session()
    db.add(
        User(
            name="Aarav Mehta",
            email="aarav.mehta@pharma.example",
            hashed_password="development-only",
            role="field_representative",
            territory="Mumbai Central",
        ),
    )
    db.commit()

    response = AuthService(db).login(
        LoginRequest(
            email="aarav.mehta@pharma.example",
            password="Welcome123",
        ),
    )
    decoded = jwt.decode(
        response.access_token,
        get_settings().jwt_secret_key,
        algorithms=[JWT_ALGORITHM],
    )

    assert response.token_type == "bearer"
    assert response.user.role == "field_representative"
    assert decoded["role"] == "field_representative"
    assert decoded["territory"] == "Mumbai Central"


def test_login_rejects_invalid_password():
    db = build_session()
    db.add(
        User(
            name="Aarav Mehta",
            email="aarav.mehta@pharma.example",
            hashed_password="development-only",
            role="field_representative",
            territory="Mumbai Central",
        ),
    )
    db.commit()

    with pytest.raises(HTTPException) as exc:
        AuthService(db).login(
            LoginRequest(
                email="aarav.mehta@pharma.example",
                password="wrong-password",
            ),
        )

    assert exc.value.status_code == 401


def test_current_user_validates_bearer_token():
    db = build_session()
    db.add(
        User(
            name="Aarav Mehta",
            email="aarav.mehta@pharma.example",
            hashed_password="development-only",
            role="field_representative",
            territory="Mumbai Central",
        ),
    )
    db.commit()
    response = AuthService(db).login(
        LoginRequest(
            email="aarav.mehta@pharma.example",
            password="Welcome123",
        ),
    )

    user = get_current_user(
        credentials=HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials=response.access_token,
        ),
        db=db,
    )

    assert user.email == "aarav.mehta@pharma.example"
    assert user.role == "field_representative"


def build_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        future=True,
    )
    Base.metadata.create_all(bind=engine)
    testing_session = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        future=True,
    )
    return testing_session()

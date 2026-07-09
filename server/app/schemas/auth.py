from app.schemas.base import ApiSchema


class LoginRequest(ApiSchema):
    email: str
    password: str


class AuthUser(ApiSchema):
    id: int
    name: str
    email: str
    role: str
    territory: str


class LoginResponse(ApiSchema):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser

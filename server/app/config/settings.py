from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI-First HCP CRM"
    environment: str = "development"
    database_url: str = Field(
        default="sqlite:///./hcp_crm.sqlite3",
        validation_alias="DATABASE_URL",
    )
    groq_api_key: str | None = Field(default=None, validation_alias="GROQ_API_KEY")
    groq_model: str = Field(default="gemma2-9b-it", validation_alias="GROQ_MODEL")
    groq_fallback_model: str = Field(
        default="llama-3.3-70b-versatile",
        validation_alias="GROQ_FALLBACK_MODEL",
    )
    jwt_secret_key: str = Field(
        default="change-me-in-production",
        validation_alias="JWT_SECRET_KEY",
    )
    client_origin: str = Field(default="http://localhost:5173", validation_alias="CLIENT_ORIGIN")
    api_rate_limit_per_minute: int = Field(
        default=120,
        validation_alias="API_RATE_LIMIT_PER_MINUTE",
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "CycleAware"
    APP_VERSION: str = "1.0.0"
    APP_URL: str = "http://localhost:5173"
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "dev_secret_key_change_in_production_min_32_bytes_random_value"
    JWT_SECRET: str = "dev_jwt_secret_change_in_production_min_32_bytes_random_value"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours in dev
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./cycleaware.db"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # File Storage
    FILE_STORAGE_PROVIDER: str = "local"
    FILE_STORAGE_PATH: str = "./private_uploads"
    MAX_FILE_SIZE_MB: int = 10

    # Operational & Safety Flags
    DEMO_MODE: bool = True
    EXPERIMENTAL_ML_ENABLED: bool = True
    CLINICAL_ML_ENABLED: bool = False  # Strict guardrail: Clinical ML is DISABLED

    # Terminology (PCOS | PCOD | PMOS)
    PRIMARY_TERMINOLOGY: str = "PMOS"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

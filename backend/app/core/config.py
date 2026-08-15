"""
Application configuration using Pydantic Settings.
"""
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    # Project
    PROJECT_NAME: str = "AI Skills Dashboard"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=False)
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://ai_skills_user:changeme@localhost:5432/ai_skills"
    )
    DB_POOL_SIZE: int = Field(default=20)
    DB_MAX_OVERFLOW: int = Field(default=40)
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000"]
    )
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # API Keys
    HH_API_KEY: str = Field(default="")
    LINKEDIN_COOKIES: str = Field(default="")
    STACKOVERFLOW_KEY: str = Field(default="")
    
    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0")
    
    # Scraping
    SCRAPE_INTERVAL_MINUTES: int = Field(default=15)
    MAX_VACANCIES_PER_REQUEST: int = Field(default=100)
    USER_AGENT: str = Field(
        default="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    )
    
    # ML
    ML_MODEL_PATH: str = Field(default="ml/models/")
    PREDICTION_HORIZON_DAYS: int = Field(default=90)
    
    # Monitoring
    SENTRY_DSN: str = Field(default="")
    LOG_LEVEL: str = Field(default="INFO")


settings = Settings()

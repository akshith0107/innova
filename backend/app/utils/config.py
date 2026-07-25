"""Configuration management for PRAMAAN AI."""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Groq API Configuration
    groq_api_key: Optional[str] = "gsk_placeholder_api_key"
    groq_model: str = "llama-3.3-70b-versatile"
    groq_temperature: float = 0.7
    groq_max_tokens: int = 4096
    
    # Tavily Search API
    tavily_api_key: Optional[str] = None
    
    # OpenAlex API (for academic research)
    openalex_email: Optional[str] = None  # Email for API identification
    
    # Semantic Scholar API (for scientific literature)
    semantic_scholar_api_key: Optional[str] = None
    
    # Database Configuration (Neon DB - Serverless PostgreSQL)
    database_url: str = "sqlite:///./pramaan.db"
    
    @property
    def async_database_url(self) -> str:
        """Return database URL formatted for async SQLAlchemy drivers (asyncpg/aiosqlite)."""
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("sqlite://"):
            url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return url

    # Qdrant Vector Database Configuration
    qdrant_url: str = "localhost:6333"
    qdrant_api_key: Optional[str] = None
    qdrant_collection_name: str = "pramaan"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"
    
    # Embedding Model
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    
    # Application Configuration
    app_name: str = "PRAMAAN AI"
    app_version: str = "1.0.0"
    debug: bool = True
    log_level: str = "INFO"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS Configuration
    allowed_origins: str = "*"
    
    # Security Configuration
    secret_key: str = "your_secret_key_here_for_jwt"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Rate Limiting Configuration
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_period: int = 60
    
    # Cache Configuration
    cache_enabled: bool = True
    cache_ttl_seconds: int = 3600
    
    # Retry Configuration
    retry_enabled: bool = True
    retry_max_attempts: int = 3
    retry_delay_seconds: int = 1


_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the global settings instance."""
    global _settings
    
    if _settings is None:
        _settings = Settings()
    
    return _settings

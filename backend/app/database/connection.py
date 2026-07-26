"""Database connection for PRAMAAN AI.

Supports Async SQLAlchemy with asyncpg / aiosqlite and connection pooling.
"""

from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from app.utils.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

# Async Engine configuration
async_engine_kwargs = {
    "echo": settings.debug,
    "future": True
}

if "postgresql" in settings.async_database_url:
    async_engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 300
    })

async_engine = create_async_engine(settings.async_database_url, **async_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Synchronous fallback engine for CLI/migration scripts
sync_db_url = settings.database_url
if sync_db_url.startswith("postgres://"):
    sync_db_url = sync_db_url.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(sync_db_url, echo=settings.debug)
except Exception as e:
    logger.warning(f"Could not create sync engine for {sync_db_url}, falling back to SQLite: {e}")
    engine = create_engine("sqlite:///./pramaan.db", echo=settings.debug)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session generator for FastAPI dependency injection."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_db() -> Session:
    """Synchronous database session generator fallback."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_async_db():
    """Initialize database tables asynchronously."""
    from app.database.models import Base
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized via Async Engine")


def init_db():
    """Initialize database tables synchronously."""
    from app.database.models import Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized via Sync Engine")

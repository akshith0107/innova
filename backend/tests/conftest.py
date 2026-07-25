"""Pytest configuration and fixtures for PRAMAAN AI tests using Async SQLAlchemy."""

import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from fastapi.testclient import TestClient

from app.database.connection import get_async_db
from app.database.models import Base
from main import app

TEST_ASYNC_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_async_engine = create_async_engine(TEST_ASYNC_DATABASE_URL, echo=False)
TestAsyncSessionLocal = async_sessionmaker(
    bind=test_async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="function")
def client():
    """Create a test client with async database dependency override.
    
    Uses a shared in-memory SQLite database for each test function.
    Tables are created via the app lifespan's init_async_db, and we override
    the DB dependency to use our test session factory.
    """
    import asyncio

    async def setup_tables():
        async with test_async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def teardown_tables():
        async with test_async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    async def override_get_async_db():
        async with TestAsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_async_db] = override_get_async_db

    # Setup tables before creating the TestClient (which triggers lifespan)
    loop = asyncio.new_event_loop()
    loop.run_until_complete(setup_tables())
    loop.close()

    with TestClient(app) as test_client:
        yield test_client

    # Teardown
    loop = asyncio.new_event_loop()
    loop.run_until_complete(teardown_tables())
    loop.close()

    app.dependency_overrides.clear()


@pytest.fixture
def sample_verification_data():
    """Sample verification data for testing."""
    return {
        "query": "What is the capital of France?",
        "llm_response": "The capital of France is Paris, which is known for the Eiffel Tower and rich cultural heritage.",
        "llm_platform": "chatgpt"
    }


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test User"
    }

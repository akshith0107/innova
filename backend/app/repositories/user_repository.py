"""UserRepository module for user authentication and management."""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository handling User entity persistence."""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Find user by email address."""
        result = await self.session.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def create_user(self, email: str, password_hash: str, name: Optional[str] = None) -> User:
        """Create and return a new user record."""
        user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            preferences={}
        )
        return await self.add(user)

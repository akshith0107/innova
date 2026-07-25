"""Base async repository module."""

from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.models import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base generic repository supporting async CRUD operations."""

    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: Any) -> Optional[ModelType]:
        """Fetch entity by primary key."""
        result = await self.session.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Fetch all entities with pagination."""
        result = await self.session.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    async def count(self) -> int:
        """Count total entities in table."""
        result = await self.session.execute(select(func.count(self.model.id)))
        return result.scalar() or 0

    async def add(self, entity: ModelType) -> ModelType:
        """Add and commit entity."""
        self.session.add(entity)
        await self.session.flush()
        return entity

"""Wikidata Service for PRAMAAN AI.

This service provides access to Wikidata knowledge graph.
"""

import httpx
from typing import Dict, Any, List
from app.utils.logger import get_logger
from app.utils.retry import retry_on_exception

logger = get_logger(__name__)


class WikidataService:
    """Service for Wikidata knowledge graph."""
    
    def __init__(self):
        """Initialize the Wikidata service."""
        self.base_url = "https://www.wikidata.org/w/api.php"
        # Use async HTTP client for better performance
        self.client = httpx.AsyncClient(timeout=30.0)
        
    @retry_on_exception(exceptions=(httpx.RequestError, httpx.TimeoutException))
    async def search_entities(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for entities in Wikidata.
        
        Args:
            query: Search query
            limit: Number of results to return
            
        Returns:
            List of entity dictionaries
        """
        try:
            params = {
                "action": "wbsearchentities",
                "search": query,
                "format": "json",
                "language": "en",
                "limit": limit
            }
            
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            entities = []
            
            for entity in data.get("search", []):
                entities.append({
                    "id": entity.get("id", ""),
                    "label": entity.get("label", ""),
                    "description": entity.get("description", ""),
                    "url": entity.get("concepturi", ""),
                    "source": "wikidata"
                })
            
            logger.info(f"Found {len(entities)} Wikidata entities")
            return entities
            
        except Exception as e:
            logger.error(f"Error searching Wikidata: {e}")
            return []

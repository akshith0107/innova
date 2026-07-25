"""OpenAlex Service for PRAMAAN AI.

This service provides access to academic research database.
"""

import httpx
from typing import Dict, Any, List
from app.utils.logger import get_logger
from app.utils.retry import retry_on_exception

logger = get_logger(__name__)


class OpenAlexService:
    """Service for OpenAlex academic database."""
    
    def __init__(self, email: str = None):
        """Initialize the OpenAlex service.
        
        Args:
            email: Email for API identification (polite usage)
        """
        self.base_url = "https://api.openalex.org"
        self.email = email
        self.headers = {}
        if email:
            self.headers["Email"] = email
        # Use async HTTP client for better performance
        self.client = httpx.AsyncClient(timeout=30.0)
            
    @retry_on_exception(exceptions=(httpx.RequestError, httpx.TimeoutException))
    async def search_works(self, query: str, filter_year: int = None) -> List[Dict[str, Any]]:
        """Search for academic works/papers.
        
        Args:
            query: Search query
            filter_year: Optional year filter
            
        Returns:
            List of academic work dictionaries
        """
        try:
            params = {
                "search": query,
                "per-page": 10,
                "filter": "publication_year:{}".format(filter_year) if filter_year else None
            }
            
            # Remove None values
            params = {k: v for k, v in params.items() if v is not None}
            
            response = await self.client.get(
                f"{self.base_url}/works",
                params=params,
                headers=self.headers
            )
            response.raise_for_status()
            
            data = response.json()
            works = []
            
            for work in data.get("results", []):
                works.append({
                    "title": work.get("title", ""),
                    "doi": work.get("doi", ""),
                    "publication_year": work.get("publication_year"),
                    "type": work.get("type", ""),
                    "cited_by_count": work.get("cited_by_count", 0),
                    "primary_location": work.get("primary_location", {}),
                    "authors": [a.get("author", {}).get("display_name", "") for a in work.get("authorships", [])[:3]],
                    "concepts": [c.get("display_name", "") for c in work.get("concepts", [])[:5]],
                    "source": "openalex"
                })
            
            logger.info(f"Found {len(works)} OpenAlex works")
            return works
            
        except Exception as e:
            logger.error(f"Error searching OpenAlex: {e}")
            return []

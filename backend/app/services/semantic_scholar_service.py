"""Semantic Scholar Service for PRAMAAN AI.

This service provides access to scientific literature search.
"""

import httpx
from typing import Dict, Any, List
from app.utils.logger import get_logger
from app.utils.retry import retry_on_exception

logger = get_logger(__name__)


class SemanticScholarService:
    """Service for Semantic Scholar academic database."""
    
    def __init__(self, api_key: str = None):
        """Initialize the Semantic Scholar service.
        
        Args:
            api_key: Optional API key for higher rate limits
        """
        self.base_url = "https://api.semanticscholar.org/graph/v1"
        self.api_key = api_key
        self.headers = {}
        if api_key:
            self.headers["x-api-key"] = api_key
        # Use async HTTP client for better performance
        self.client = httpx.AsyncClient(timeout=30.0)
            
    @retry_on_exception(exceptions=(httpx.RequestError, httpx.TimeoutException))
    async def search_papers(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for academic papers.
        
        Args:
            query: Search query
            limit: Number of results to return
            
        Returns:
            List of paper dictionaries
        """
        try:
            params = {
                "query": query,
                "limit": limit,
                "fields": "title,abstract,authors,year,citationCount,url,venue"
            }
            
            response = await self.client.get(
                f"{self.base_url}/paper/search",
                params=params,
                headers=self.headers
            )
            response.raise_for_status()
            
            data = response.json()
            papers = []
            
            for paper in data.get("data", []):
                papers.append({
                    "title": paper.get("title", ""),
                    "abstract": paper.get("abstract", "")[:500] if paper.get("abstract") else "",
                    "authors": [a.get("name", "") for a in paper.get("authors", [])[:3]],
                    "year": paper.get("year"),
                    "citation_count": paper.get("citationCount", 0),
                    "url": paper.get("url", ""),
                    "venue": paper.get("venue", ""),
                    "source": "semantic_scholar"
                })
            
            logger.info(f"Found {len(papers)} Semantic Scholar papers")
            return papers
            
        except Exception as e:
            logger.error(f"Error searching Semantic Scholar: {e}")
            return []

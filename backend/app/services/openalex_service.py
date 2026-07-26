"""OpenAlex Service for PRAMAAN AI — Passage Grounding & Abstract Reconstruction.

Fetches and reconstructs actual abstracts from OpenAlex inverted index. OpenAlex records
without abstract passages are excluded from evidence reasoning.
"""

import httpx
from typing import Dict, Any, List, Optional
from app.utils.logger import get_logger
from app.utils.retry import retry_on_exception

logger = get_logger(__name__)


def reconstruct_abstract(abstract_inverted_index: Optional[Dict[str, List[int]]]) -> str:
    """Reconstructs text abstract from OpenAlex inverted index dictionary."""
    if not abstract_inverted_index or not isinstance(abstract_inverted_index, dict):
        return ""
    
    pos_word_map = {}
    for word, positions in abstract_inverted_index.items():
        for pos in positions:
            pos_word_map[pos] = word
            
    sorted_positions = sorted(pos_word_map.keys())
    return " ".join(pos_word_map[pos] for pos in sorted_positions)


class OpenAlexService:
    """Service for OpenAlex academic database with passage grounding."""
    
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
        self.client = httpx.AsyncClient(timeout=15.0)
            
    @retry_on_exception(exceptions=(httpx.RequestError, httpx.TimeoutException))
    async def search_works(self, query: str, filter_year: int = None) -> List[Dict[str, Any]]:
        """Search for academic works/papers with actual abstract passages.
        
        Args:
            query: Search query
            filter_year: Optional year filter
            
        Returns:
            List of academic work dictionaries with reconstructed abstract passages
        """
        try:
            params = {
                "search": query,
                "per-page": 10,
                "filter": f"publication_year:{filter_year}" if filter_year else None
            }
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
                abstract_text = reconstruct_abstract(work.get("abstract_inverted_index"))
                
                # REQUIREMENT 4: Only include record if actual abstract passage text exists!
                if abstract_text:
                    works.append({
                        "title": work.get("title", ""),
                        "doi": work.get("doi", ""),
                        "publication_year": work.get("publication_year"),
                        "type": work.get("type", ""),
                        "cited_by_count": work.get("cited_by_count", 0),
                        "snippet": abstract_text,
                        "content": abstract_text,
                        "url": work.get("doi") or work.get("id") or "https://openalex.org",
                        "authors": [a.get("author", {}).get("display_name", "") for a in work.get("authorships", [])[:3]],
                        "source": "openalex",
                        "source_tier": "Academic Literature"
                    })
            
            logger.info(f"Found {len(works)} OpenAlex works with verified abstract passages")
            return works
            
        except Exception as e:
            logger.error(f"Error searching OpenAlex: {e}")
            return []

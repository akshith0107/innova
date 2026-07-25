"""Tavily Search API service for AI-powered search."""

from typing import Optional, List, Dict, Any
from tavily import TavilyClient
from app.utils.config import get_settings
from app.utils.logger import get_logger


class TavilyService:
    """Service for interacting with Tavily Search API.
    
    Tavily provides AI-powered search with context-aware results,
    perfect for fact verification tasks.
    
    Attributes:
        client: The Tavily API client instance.
        max_results: Default maximum number of results to return.
    """
    
    def __init__(self, api_key: Optional[str] = None, max_results: int = 10):
        """Initialize the Tavily service.
        
        Args:
            api_key: Tavily API key. If None, loads from settings.
            max_results: Default maximum number of results to return.
        """
        settings = get_settings()
        api_key = api_key or settings.tavily_api_key
        
        if not api_key:
            self.logger = get_logger(__name__)
            self.logger.warning("Tavily API key not provided, service will be disabled")
            self.client = None
        else:
            self.client = TavilyClient(api_key=api_key)
            self.logger = get_logger(__name__)
            self.logger.info("TavilyService initialized")
        
        self.max_results = max_results
    
    def search(
        self,
        query: str,
        max_results: Optional[int] = None,
        search_depth: str = "basic",
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Perform a search query using Tavily.
        
        Args:
            query: The search query string.
            max_results: Maximum number of results to return.
            search_depth: Search depth ("basic" or "advanced").
            include_domains: List of domains to include in results.
            exclude_domains: List of domains to exclude from results.
        
        Returns:
            List[Dict[str, Any]]: List of search results.
            
        Raises:
            ValueError: If search fails or client is not initialized.
        """
        if not self.client:
            raise ValueError("Tavily client not initialized - missing API key")
        
        try:
            self.logger.info(f"Tavily search: {query[:100]}...")
            
            results = self.client.search(
                query=query,
                max_results=max_results or self.max_results,
                search_depth=search_depth,
                include_domains=include_domains,
                exclude_domains=exclude_domains
            )
            
            self.logger.info(f"Tavily returned {len(results.get('results', []))} results")
            
            return results.get("results", [])
            
        except Exception as e:
            self.logger.error(f"Tavily search failed: {str(e)}")
            raise ValueError(f"Tavily search failed: {str(e)}")

    async def search_async(
        self,
        query: str,
        max_results: Optional[int] = None,
        search_depth: str = "basic",
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Perform search query asynchronously using asyncio thread execution."""
        import asyncio
        return await asyncio.to_thread(
            self.search, query, max_results, search_depth, include_domains, exclude_domains
        )
    
    def get_answer(
        self,
        query: str,
        max_results: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get a direct answer to a question using Tavily.
        
        Args:
            query: The question to answer.
            max_results: Maximum number of results to use for answering.
        
        Returns:
            Dict[str, Any]: Response with answer and sources.
        """
        if not self.client:
            raise ValueError("Tavily client not initialized - missing API key")
        
        try:
            self.logger.info(f"Tavily get_answer: {query[:100]}...")
            
            response = self.client.get_answer(
                query=query,
                max_results=max_results or self.max_results
            )
            
            self.logger.info("Tavily answer retrieved successfully")
            
            return response
            
        except Exception as e:
            self.logger.error(f"Tavily get_answer failed: {str(e)}")
            raise ValueError(f"Tavily get_answer failed: {str(e)}")


# Global service instance
_tavily_service: Optional[TavilyService] = None


def get_tavily_service() -> TavilyService:
    """Get the global Tavily service instance."""
    global _tavily_service
    
    if _tavily_service is None:
        _tavily_service = TavilyService()
    
    return _tavily_service

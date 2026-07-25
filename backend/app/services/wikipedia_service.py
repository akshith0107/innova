import asyncio
import wikipedia
from typing import Dict, Any, List
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _fetch_wikipedia_articles(query: str, results: int) -> List[Dict[str, Any]]:
    search_results = wikipedia.search(query, results=results)
    articles = []
    for title in search_results:
        try:
            page = wikipedia.page(title, auto_suggest=False)
            articles.append({
                "title": page.title,
                "url": page.url,
                "content": page.content[:1000],
                "summary": page.summary[:500],
                "source": "wikipedia",
                "references": page.references[:5] if page.references else []
            })
        except (wikipedia.exceptions.PageError, wikipedia.exceptions.DisambiguationError) as e:
            logger.warning(f"Wikipedia page fetch skipped for '{title}': {e}")
            continue
    return articles


class WikipediaService:
    """Service for Wikipedia search and retrieval."""
    
    def __init__(self):
        """Initialize the Wikipedia service."""
        wikipedia.set_lang("en")
        
    async def search(self, query: str, results: int = 5) -> List[Dict[str, Any]]:
        """Search Wikipedia for relevant articles asynchronously."""
        try:
            articles = await asyncio.to_thread(_fetch_wikipedia_articles, query, results)
            logger.info(f"Found {len(articles)} Wikipedia articles")
            return articles
        except Exception as e:
            logger.error(f"Error searching Wikipedia: {e}")
            return []

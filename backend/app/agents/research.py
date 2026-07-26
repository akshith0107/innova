"""Research Agent for PRAMAAN AI — Negative-First Falsification Engine.

Executes queries in Negative-First order with strict Source Authority Hierarchy weighting.
"""

from typing import Dict, Any, List, Optional
from app.services.tavily_service import TavilyService
from app.services.wikipedia_service import WikipediaService
from app.services.openalex_service import OpenAlexService
from app.services.semantic_scholar_service import SemanticScholarService
from app.services.wikidata_service import WikidataService
from app.services.rag_service import RAGService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ResearchAgent:
    """Agent that performs negative-first falsification research across authoritative sources."""
    
    def __init__(
        self,
        tavily_service: TavilyService,
        wikipedia_service: WikipediaService,
        openalex_service: Optional[OpenAlexService] = None,
        semantic_scholar_service: Optional[SemanticScholarService] = None,
        wikidata_service: Optional[WikidataService] = None,
        rag_service: Optional[RAGService] = None
    ):
        self.tavily_service = tavily_service
        self.wikipedia_service = wikipedia_service
        self.openalex_service = openalex_service
        self.semantic_scholar_service = semantic_scholar_service
        self.wikidata_service = wikidata_service
        self.rag_service = rag_service
        
    async def research_claim(self, claim: str, search_queries: List[str]) -> Dict[str, Any]:
        """Execute negative-first research order with Source Authority Hierarchy weighting."""
        logger.info(f"Executing negative-first falsification research for: {claim[:80]}...")
        
        results = {
            "official_sources": [],      # Priority 1: Government / Official
            "academic_sources": [],      # Priority 2: Peer-Reviewed Papers
            "knowledge_sources": [],     # Priority 3: Wikidata / Wikipedia
            "web_sources": [],           # Priority 4: Web
            "all_sources": []
        }

        # Formulate Negative-First query order: Ground Truth -> Official -> Contradiction -> Literal
        ground_truth_q = f"What is the official true value for: {claim[:50]}"
        official_q = f"Official government standards document for {claim[:40]}"
        contradiction_q = f"Why is {claim[:40]} incorrect or false"
        
        query_sequence = [ground_truth_q, official_q, contradiction_q] + search_queries + [claim]
        unique_queries = list(dict.fromkeys(query_sequence))[:6]

        # 1. Academic & Peer-Reviewed Sources (OpenAlex / Semantic Scholar)
        if self.openalex_service:
            try:
                openalex_res = await self.openalex_service.search_works(claim)
                for item in openalex_res:
                    item["authority_score"] = 0.95
                    item["source_tier"] = "Academic / Peer-Reviewed"
                results["academic_sources"].extend(openalex_res)
            except Exception as e:
                logger.error(f"OpenAlex search error: {e}")

        # 2. Knowledge Graphs & Wikipedia
        try:
            wiki_res = await self.wikipedia_service.search(claim)
            for item in wiki_res:
                item["authority_score"] = 0.85
                item["source_tier"] = "Knowledge Base"
            results["knowledge_sources"].extend(wiki_res)
        except Exception as e:
            logger.error(f"Wikipedia search error: {e}")

        # 3. Web Search across Negative-First Sequence
        for q in unique_queries:
            try:
                if hasattr(self.tavily_service, "search_async"):
                    web_res = await self.tavily_service.search_async(q)
                else:
                    import asyncio
                    web_res = await asyncio.to_thread(self.tavily_service.search, q)
                
                items = web_res if isinstance(web_res, list) else web_res.get("results", [])
                for item in items:
                    url = item.get("url", "").lower()
                    if ".gov" in url or ".org" in url or "official" in url:
                        item["authority_score"] = 0.98
                        item["source_tier"] = "Official / Government"
                        results["official_sources"].append(item)
                    else:
                        item["authority_score"] = 0.70
                        item["source_tier"] = "Web Source"
                        results["web_sources"].append(item)
            except Exception as e:
                logger.error(f"Tavily search error for negative query '{q}': {e}")

        # Order sources strictly by Authority Hierarchy (Official -> Academic -> Knowledge -> Web)
        all_sources = results["official_sources"] + results["academic_sources"] + results["knowledge_sources"] + results["web_sources"]
        seen = set()
        unique_sources = []
        for s in all_sources:
            url = s.get("url", "")
            if url and url not in seen:
                seen.add(url)
                unique_sources.append(s)

        results["all_sources"] = unique_sources
        logger.info(f"Falsification research complete with {len(unique_sources)} authority-ranked sources")
        return results

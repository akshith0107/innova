"""Research Agent for PRAMAAN AI.

This agent performs RAG-based research using multiple data sources with layered trust approach.
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
    """Agent that retrieves information from multiple sources with layered trust."""
    
    def __init__(
        self,
        tavily_service: TavilyService,
        wikipedia_service: WikipediaService,
        openalex_service: Optional[OpenAlexService] = None,
        semantic_scholar_service: Optional[SemanticScholarService] = None,
        wikidata_service: Optional[WikidataService] = None,
        rag_service: Optional[RAGService] = None
    ):
        """Initialize the research agent with layered trust sources.
        
        Args:
            tavily_service: Service for web search (Layer 3 - Web)
            wikipedia_service: Service for Wikipedia search (Layer 2 - Knowledge)
            openalex_service: Service for academic research (Layer 1 - Academic)
            semantic_scholar_service: Service for scientific literature (Layer 1 - Academic)
            wikidata_service: Service for knowledge graph (Layer 2 - Knowledge)
            rag_service: Optional service for RAG semantic retrieval (Layer 2 - Knowledge)
        """
        self.tavily_service = tavily_service
        self.wikipedia_service = wikipedia_service
        self.openalex_service = openalex_service
        self.semantic_scholar_service = semantic_scholar_service
        self.wikidata_service = wikidata_service
        self.rag_service = rag_service
        
    async def research_claim(self, claim: str, search_queries: List[str]) -> Dict[str, Any]:
        """Research a claim using layered trust approach.
        
        Layer 1 (Highest Trust): Academic sources (OpenAlex, Semantic Scholar)
        Layer 2 (Medium Trust): Knowledge sources (Wikipedia, Wikidata, RAG)
        Layer 3 (Base Trust): Web sources (Tavily)
        
        Args:
            claim: The factual claim to research
            search_queries: List of search queries for the claim
            
        Returns:
            Dictionary containing results from all sources with trust layers
        """
        logger.info(f"Researching claim with layered trust: {claim[:100]}...")
        
        results = {
            "layer1_academic": [],  # Highest trust
            "layer2_knowledge": [],  # Medium trust
            "layer3_web": [],  # Base trust
            "all_sources": []
        }
        
        # LAYER 1: Academic Sources (Highest Trust)
        logger.info("Layer 1: Searching academic sources...")
        
        # OpenAlex - Academic research database
        if self.openalex_service:
            try:
                openalex_results = await self.openalex_service.search_works(claim)
                for result in openalex_results:
                    result["trust_layer"] = 1
                    result["source_type"] = "academic"
                    result["credibility_boost"] = 0.3
                results["layer1_academic"].extend(openalex_results)
                logger.info(f"OpenAlex: {len(openalex_results)} papers found")
            except Exception as e:
                logger.error(f"Error in OpenAlex search: {e}")
        
        # Semantic Scholar - Scientific literature
        if self.semantic_scholar_service:
            try:
                semantic_results = await self.semantic_scholar_service.search_papers(claim)
                for result in semantic_results:
                    result["trust_layer"] = 1
                    result["source_type"] = "academic"
                    result["credibility_boost"] = 0.3
                results["layer1_academic"].extend(semantic_results)
                logger.info(f"Semantic Scholar: {len(semantic_results)} papers found")
            except Exception as e:
                logger.error(f"Error in Semantic Scholar search: {e}")
        
        # LAYER 2: Knowledge Sources (Medium Trust)
        logger.info("Layer 2: Searching knowledge sources...")
        
        # Wikipedia - Encyclopedia
        try:
            wiki_results = await self.wikipedia_service.search(claim)
            for result in wiki_results:
                result["trust_layer"] = 2
                result["source_type"] = "knowledge"
                result["credibility_boost"] = 0.15
            results["layer2_knowledge"].extend(wiki_results)
            logger.info(f"Wikipedia: {len(wiki_results)} articles found")
        except Exception as e:
            logger.error(f"Error in Wikipedia search: {e}")
        
        # Wikidata - Knowledge graph
        if self.wikidata_service:
            try:
                wikidata_results = await self.wikidata_service.search_entities(claim)
                for result in wikidata_results:
                    result["trust_layer"] = 2
                    result["source_type"] = "knowledge"
                    result["credibility_boost"] = 0.15
                results["layer2_knowledge"].extend(wikidata_results)
                logger.info(f"Wikidata: {len(wikidata_results)} entities found")
            except Exception as e:
                logger.error(f"Error in Wikidata search: {e}")
        
        # RAG - Uploaded documents
        if self.rag_service:
            try:
                rag_results = await self.rag_service.retrieve_relevant(
                    query=claim,
                    limit=5,
                    score_threshold=0.5
                )
                for rag_result in rag_results:
                    payload = rag_result.get("payload", {})
                    rag_source = {
                        "title": payload.get("filename", "RAG Document"),
                        "url": f"document://{payload.get('document_id', 'unknown')}",
                        "content": payload.get("text", ""),
                        "score": rag_result.get("score", 0.0),
                        "trust_layer": 2,
                        "source_type": "rag",
                        "credibility_boost": 0.1,
                        "chunk_id": payload.get("chunk_id", -1)
                    }
                    results["layer2_knowledge"].append(rag_source)
                logger.info(f"RAG: {len(rag_results)} chunks found")
            except Exception as e:
                logger.error(f"Error in RAG retrieval: {e}")
        
        # LAYER 3: Web Sources (Base Trust)
        logger.info("Layer 3: Searching web sources...")
        
        # Tavily - Web search
        try:
            for query in search_queries[:3]:  # Limit to top 3 queries
                if hasattr(self.tavily_service, "search_async"):
                    web_results = await self.tavily_service.search_async(query)
                else:
                    import asyncio
                    web_results = await asyncio.to_thread(self.tavily_service.search, query)
                    
                tavily_items = web_results if isinstance(web_results, list) else web_results.get("results", [])
                for result in tavily_items:
                    result["trust_layer"] = 3
                    result["source_type"] = "web"
                    result["credibility_boost"] = 0.0
                results["layer3_web"].extend(tavily_items)
            logger.info(f"Tavily: {len(results['layer3_web'])} web results found")
        except Exception as e:
            logger.error(f"Error in web search: {e}")
        
        # Combine all sources with layer ordering (Layer 1 first)
        all_sources = []
        all_sources.extend(results["layer1_academic"])  # Highest trust first
        all_sources.extend(results["layer2_knowledge"])  # Medium trust
        all_sources.extend(results["layer3_web"])  # Base trust last
        
        # Deduplicate by URL while preserving layer order
        seen_urls = set()
        unique_sources = []
        for source in all_sources:
            url = source.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append(source)
        
        results["all_sources"] = unique_sources
        
        # Summary statistics
        layer_stats = {
            "layer1_count": len(results["layer1_academic"]),
            "layer2_count": len(results["layer2_knowledge"]),
            "layer3_count": len(results["layer3_web"]),
            "total_unique": len(unique_sources)
        }
        
        logger.info(f"Research complete - Layer stats: {layer_stats}")
        results["layer_stats"] = layer_stats
        
        return results

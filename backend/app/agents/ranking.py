"""Source Ranking Agent for PRAMAAN AI.

This agent ranks sources by credibility, recency, and relevance.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RankingAgent:
    """Agent that ranks sources by credibility and relevance."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the ranking agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def rank_sources(self, sources: List[Dict[str, Any]], claim: str) -> List[Dict[str, Any]]:
        """Rank sources by credibility, recency, relevance, and layered trust asynchronously."""
        logger.info(f"Ranking {len(sources)} sources with layered trust")
        
        if not sources:
            return []
        
        # Apply layered trust boosts and calculate base scores
        for source in sources:
            trust_layer = source.get("trust_layer", 3)
            credibility_boost = source.get("credibility_boost", 0.0)
            
            # Base credibility score based on trust layer
            base_credibility = {
                1: 0.8,  # Academic sources start high
                2: 0.6,  # Knowledge sources start medium
                3: 0.4   # Web sources start lower
            }.get(trust_layer, 0.5)
            
            # Apply credibility boost
            source["base_credibility"] = base_credibility
            source["credibility_score"] = min(1.0, base_credibility + credibility_boost)
            source["trust_layer"] = trust_layer
            
            # Default scores for other factors
            source.setdefault("recency_score", 0.5)
            source.setdefault("relevance_score", 0.5)
        
        # Prepare source context for LLM-based refinement
        source_context = "\n\n".join([
            f"Source {i+1}:\n"
            f"Title: {source.get('title', 'Unknown')}\n"
            f"URL: {source.get('url', 'Unknown')}\n"
            f"Trust Layer: {source.get('trust_layer', 3)}\n"
            f"Base Credibility: {source.get('base_credibility', 0.5)}\n"
            f"Content: {source.get('content', source.get('snippet', ''))[:300]}"
            for i, source in enumerate(sources)
        ])
        
        system_prompt = """You are an expert at evaluating source credibility and relevance with layered trust. Your task is to:
1. Analyze each source's domain and URL for credibility indicators
2. Consider the trust layer (1=Academic highest, 2=Knowledge medium, 3=Web base)
3. Assess the content quality and relevance to the claim
4. Consider recency if dates are available
5. Rate each source on credibility, recency, and relevance

Output a JSON object with key "ranked_sources" containing an array of ranked source objects:
- source_title: Title of the source
- source_url: URL of the source
- trust_layer: Trust layer (1, 2, or 3)
- credibility_score: 0.0-1.0 credibility rating (consider trust layer)
- recency_score: 0.0-1.0 recency rating (1.0 = very recent)
- relevance_score: 0.0-1.0 relevance to the claim
- overall_score: Combined weighted score (credibility 50%, recency 15%, relevance 35%)
- tier: "A" (0.8-1.0), "B" (0.6-0.8), "C" (0.4-0.6), "D" (0.0-0.4)
- reasoning: Brief explanation of the ranking"""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"""Claim: {claim}

Sources:
{source_context}

Rank these sources considering their trust layers and credibility.""")
                ]
            )
            
            ranked_sources = response.get("ranked_sources", []) if isinstance(response, dict) else (response if isinstance(response, list) else [])
            
            # Sort by overall score, then by trust layer (lower layer = higher priority)
            ranked_sources.sort(
                key=lambda x: (x.get("overall_score", 0), -x.get("trust_layer", 3)), 
                reverse=True
            )
            
            logger.info(f"Ranked {len(ranked_sources)} sources with layered trust")
            return ranked_sources
            
        except Exception as e:
            logger.error(f"Error ranking sources: {e}")
            # Fallback: use rule-based ranking with trust layers
            for source in sources:
                credibility = source.get("credibility_score", 0.5)
                recency = source.get("recency_score", 0.5)
                relevance = source.get("relevance_score", 0.5)
                
                # Weighted score (credibility 50%, recency 15%, relevance 35%)
                overall = (credibility * 0.5) + (recency * 0.15) + (relevance * 0.35)
                source["overall_score"] = overall
                
                # Tier assignment
                if overall >= 0.8:
                    source["tier"] = "A"
                elif overall >= 0.6:
                    source["tier"] = "B"
                elif overall >= 0.4:
                    source["tier"] = "C"
                else:
                    source["tier"] = "D"
            
            # Sort by overall score and trust layer
            sources.sort(
                key=lambda x: (x.get("overall_score", 0), -x.get("trust_layer", 3)),
                reverse=True
            )
            
            logger.info(f"Used fallback ranking for {len(sources)} sources")
            return sources

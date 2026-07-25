"""Evidence Agent for PRAMAAN AI.

This agent extracts relevant evidence from retrieved documents.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EvidenceAgent:
    """Agent that extracts and structures evidence from sources."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the evidence agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def extract_evidence(self, claim: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract relevant evidence from sources for a given claim asynchronously."""
        logger.info(f"Extracting evidence for claim: {claim[:100]}...")
        
        if not sources:
            logger.warning("No sources provided for evidence extraction")
            return []
        
        # Prepare source context
        source_context = "\n\n".join([
            f"Source {i+1}: {source.get('title', 'Unknown')}\n"
            f"URL: {source.get('url', 'Unknown')}\n"
            f"Content: {source.get('content', source.get('snippet', ''))[:500]}"
            for i, source in enumerate(sources[:10])  # Limit to top 10 sources
        ])
        
        system_prompt = """You are an expert at extracting relevant evidence from documents. Your task is to:
1. Analyze the factual claim
2. Review the provided source documents
3. Extract specific evidence that relates to the claim
4. Classify evidence as supporting, contradicting, or neutral
5. Rate the relevance and confidence of each evidence

Output a JSON object with key "evidence" containing an array of evidence items:
- evidence_text: The exact evidence excerpt
- source_url: URL of the source
- source_title: Title of the source
- relevance_score: 0.0-1.0 relevance to the claim
- evidence_type: "supporting", "contradicting", or "neutral"
- confidence: 0.0-1.0 confidence in evidence accuracy
- key_facts: List of key facts extracted from the evidence"""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"""Claim: {claim}

Sources:
{source_context}

Extract relevant evidence for this claim.""")
                ]
            )
            
            evidence_list = response.get("evidence", []) if isinstance(response, dict) else (response if isinstance(response, list) else [])
            logger.info(f"Extracted {len(evidence_list)} evidence items")
            return evidence_list
            
        except Exception as e:
            logger.error(f"Error extracting evidence: {e}")
            # Fallback: create basic evidence from sources
            return [{
                "evidence_text": source.get("content", source.get("snippet", ""))[:200],
                "source_url": source.get("url", ""),
                "source_title": source.get("title", "Unknown"),
                "relevance_score": 0.5,
                "evidence_type": "neutral",
                "confidence": 0.3,
                "key_facts": []
            } for source in sources[:3]]

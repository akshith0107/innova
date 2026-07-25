"""Claim Extraction Agent for PRAMAAN AI.

Extracts ALL atomic factual assertions with ZERO claim discarding policy.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ClaimExtractionAgent:
    """Agent that extracts all factual claims with zero claim discarding policy."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the claim extraction agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def extract_claims(self, text: str) -> List[Dict[str, Any]]:
        """Extract all atomic factual claims from text asynchronously."""
        logger.info(f"Extracting all claims from text ({len(text)} characters) - Zero Discard Policy")
        
        system_prompt = """You are an expert Claim Extraction Agent. Your task is to extract EVERY factual assertion in the text.

CRITICAL INSTRUCTIONS:
1. Extract ALL testable claims (facts, numbers, dates, statistics, entities, places, scientific/medical assertions).
2. DO NOT filter out false, controversial, or dubious claims. Extract false claims EXACTLY as written!
3. Extract each sentence or sub-assertion into an individual claim object.

Output a JSON object with key "claims" containing an array of claim objects:
- claim_text: The exact factual assertion
- claim_type: "statistic", "date", "fact", "entity", "location", "scientific", "historical", "technology"
- context: Surrounding context sentence
- confidence: 0.0-1.0 extraction accuracy
"""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"Extract all factual claims from:\n\n{text}")
                ]
            )
            
            claims = response.get("claims", []) if isinstance(response, dict) else (response if isinstance(response, list) else [])
            if claims:
                logger.info(f"Extracted {len(claims)} claims without discarding")
                return claims
            
        except Exception as e:
            logger.error(f"Error extracting claims: {e}")
            
        # Sentence-splitting fallback: ensure every sentence becomes a claim!
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 8]
        return [
            {
                "claim_text": sentence,
                "claim_type": "fact",
                "context": sentence,
                "confidence": 0.9
            }
            for sentence in sentences
        ]

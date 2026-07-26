"""Claim Extraction Agent for PRAMAAN AI.

Extracts ALL atomic factual assertions with ZERO claim discarding policy and classifies claim categories.
"""

from typing import Dict, Any, List
import re
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


def classify_claim_category(claim_text: str) -> str:
    """Classifies claim into fine-grained category."""
    c_lower = claim_text.lower()
    
    if any(k in c_lower for k in ["cure", "disease", "medicine", "doctor", "health", "bleach", "virus", "vaccine"]):
        return "MEDICAL"
    if re.search(r"\b(\d+)\b", c_lower) or any(k in c_lower for k in ["percent", "%", "number", "count", "amount"]):
        return "NUMERICAL"
    if any(k in c_lower for k in ["president", "war", "century", "king", "queen", "bc", "ad", "history"]):
        return "HISTORICAL"
    if any(k in c_lower for k in ["orbit", "boil", "celsius", "atom", "molecule", "gravity", "physics", "speed of light"]):
        return "SCIENTIFIC"
    if any(k in c_lower for k in ["fly to the moon", "teleport", "wi-fi", "wifi", "engine", "plastic gold"]):
        return "PHYSICAL_POSSIBILITY"
    if any(k in c_lower for k in ["best", "worst", "delicious", "flavor", "think", "feel", "opinion"]):
        return "OPINION"
    if any(k in c_lower for k in ["will", "predict", "future", "2030", "2050"]):
        return "PREDICTION"
    if any(k in c_lower for k in ["law", "court", "legal", "constitution", "article", "section"]):
        return "LEGAL"
    if any(k in c_lower for k in ["ai", "software", "computer", "internet", "device"]):
        return "TECHNOLOGICAL"
        
    return "FACTUAL"


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
- claim_type: "HISTORICAL", "SCIENTIFIC", "MEDICAL", "NUMERICAL", "BIOGRAPHICAL", "LEGAL", "OPINION", "PREDICTION", "PHYSICAL_POSSIBILITY", "TECHNOLOGICAL"
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
                for c in claims:
                    if isinstance(c, dict):
                        c["category"] = classify_claim_category(c.get("claim_text", ""))
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
                "category": classify_claim_category(sentence),
                "context": sentence,
                "confidence": 0.9
            }
            for sentence in sentences
        ]

"""Evidence Agent for PRAMAAN AI — Falsification Architecture.

Evaluates evidence Authority, Reliability, Recency, and Independence to isolate disconfirming passages.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EvidenceAgent:
    """Agent that evaluates disconfirming evidence across Authority, Reliability, and Recency."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the evidence agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def extract_evidence(
        self,
        claim: str,
        sources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Extract and evaluate disconfirming evidence against authority metrics."""
        logger.info(f"Evaluating falsification evidence metrics for claim: {claim[:80]}...")
        
        source_snippets = "\n\n".join([
            f"Source {i+1} [{s.get('source_tier', 'Web')}] ({s.get('title', 'Untitled')}) [URL: {s.get('url', '')}]:\n{s.get('content', s.get('snippet', ''))[:400]}"
            for i, s in enumerate(sources[:8])
        ])
        
        system_prompt = """You are an Lead Investigative Fact-Checker. Your goal is to identify evidence that FALSIFIES or REFUETS the claim first!

Evaluate every passage for:
1. Authority: Official government/academic bodies get 1.0; blogs get 0.2.
2. Reliability: Peer-reviewed/official documentation.
3. Recency: How recently updated.
4. Independence: Third-party non-affiliated sources.

Categorize evidence into THREE arrays:
1. contradicting_evidence: Evidence passages that explicitly DISPROVE or contradict the claim (Highest Investigation Priority!).
2. supporting_evidence: Passages that explicitly confirm the claim.
3. neutral_evidence: Definitions or reference context.

Output a JSON object with:
- contradicting_evidence: list of objects (quote, source_title, url, authority_score, reasoning)
- supporting_evidence: list of objects (quote, source_title, url, authority_score)
- neutral_evidence: list of objects (quote, source_title, url)
- evidence_strength: float (0.0 - 100.0)
- source_authority_score: float (0.0 - 100.0)
- summary: str
"""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"Claim: {claim}\n\nRetrieved Authority Sources:\n{source_snippets}")
                ]
            )

            if isinstance(response, dict):
                return {
                    "claim": claim,
                    "contradicting_evidence": response.get("contradicting_evidence", []),
                    "supporting_evidence": response.get("supporting_evidence", []),
                    "neutral_evidence": response.get("neutral_evidence", []),
                    "evidence_strength": float(response.get("evidence_strength", 75.0)),
                    "source_authority_score": float(response.get("source_authority_score", 85.0)),
                    "summary": response.get("summary", "Falsification evidence evaluation finished.")
                }
        except Exception as e:
            logger.error(f"Error in EvidenceAgent: {e}")

        # Rule-based fallback
        return {
            "claim": claim,
            "contradicting_evidence": [],
            "supporting_evidence": [],
            "neutral_evidence": [],
            "evidence_strength": 50.0,
            "source_authority_score": 70.0,
            "summary": "Fallback evidence extraction."
        }

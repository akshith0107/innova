"""Evidence Agent for PRAMAAN AI — Source Weighting & Domain Deduplication.

Evaluates evidence Authority, Source Weights, Domain Independence, and Recency.
"""

from typing import Dict, Any, List
from urllib.parse import urlparse
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Authority Weight Multipliers
SOURCE_AUTHORITY_WEIGHTS = {
    "OFFICIAL_GOVERNMENT": 1.0,
    "PEER_REVIEWED_ACADEMIC": 0.95,
    "KNOWLEDGE_BASE": 0.85,
    "NEWS": 0.75,
    "BLOG": 0.40,
    "FORUM": 0.20,
    "LLM": 0.10
}


def calculate_source_weight(url: str, source_tier: str = "Web") -> float:
    """Calculates granular credibility weight based on domain and source tier."""
    domain = urlparse(url).netloc.lower() if url else ""
    
    if any(domain.endswith(tld) for tld in [".gov", ".gov.in", ".gov.uk", ".mil", ".edu"]) or "official" in source_tier.lower():
        return SOURCE_AUTHORITY_WEIGHTS["OFFICIAL_GOVERNMENT"]
    if any(d in domain for d in ["arxiv.org", "nature.com", "sciencedirect.com", "ncbi.nlm.nih.gov", "ieee.org"]):
        return SOURCE_AUTHORITY_WEIGHTS["PEER_REVIEWED_ACADEMIC"]
    if "wikipedia" in domain or "wikidata" in domain or "britannica" in domain:
        return SOURCE_AUTHORITY_WEIGHTS["KNOWLEDGE_BASE"]
    if any(d in domain for d in ["reuters.com", "apnews.com", "bbc.com", "nytimes.com", "bloomberg.com"]):
        return SOURCE_AUTHORITY_WEIGHTS["NEWS"]
    if any(d in domain for d in ["medium.com", "wordpress.com", "blogspot.com"]):
        return SOURCE_AUTHORITY_WEIGHTS["BLOG"]
    if any(d in domain for d in ["reddit.com", "quora.com", "twitter.com", "x.com"]):
        return SOURCE_AUTHORITY_WEIGHTS["FORUM"]
        
    return 0.60


def deduplicate_domains(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deduplicates sources from duplicate domains/mirrors and calculates domain diversity score."""
    seen_domains = set()
    unique_sources = []
    
    for s in sources:
        url = s.get("url", "")
        domain = urlparse(url).netloc.lower() if url else s.get("title", "")
        if domain and domain not in seen_domains:
            seen_domains.add(domain)
            s["weight"] = calculate_source_weight(url, s.get("source_tier", "Web"))
            unique_sources.append(s)
            
    return unique_sources


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
        
        unique_sources = deduplicate_domains(sources)
        
        source_snippets = "\n\n".join([
            f"Source {i+1} [Weight: {s.get('weight', 0.6)}] ({s.get('title', 'Untitled')}) [URL: {s.get('url', '')}]:\n{s.get('content', s.get('snippet', ''))[:400]}"
            for i, s in enumerate(unique_sources[:8])
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
                contradicting = response.get("contradicting_evidence", [])
                supporting = response.get("supporting_evidence", [])

                # Annotate evidence items with granular source weights
                for item in contradicting + supporting:
                    if isinstance(item, dict):
                        item["source_weight"] = calculate_source_weight(item.get("url", ""))

                return {
                    "claim": claim,
                    "contradicting_evidence": contradicting,
                    "supporting_evidence": supporting,
                    "neutral_evidence": response.get("neutral_evidence", []),
                    "evidence_strength": float(response.get("evidence_strength", 75.0)),
                    "source_authority_score": float(response.get("source_authority_score", 85.0)),
                    "unique_domains_count": len(set(urlparse(s.get("url", "")).netloc for s in unique_sources)),
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
            "unique_domains_count": 0,
            "summary": "Fallback evidence extraction."
        }

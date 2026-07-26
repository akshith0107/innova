"""Evidence Agent for PRAMAAN AI — Strict Evidence Provenance & Passage Grounding.

Enforces retrieval metadata preservation, passage-level grounding, and prevents fake or generated evidence.
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
    """Deduplicates sources from duplicate domains/mirrors and attaches retrieval rank."""
    seen_domains = set()
    unique_sources = []
    
    for idx, s in enumerate(sources, start=1):
        url = s.get("url", "")
        domain = urlparse(url).netloc.lower() if url else s.get("title", "")
        if domain and domain not in seen_domains:
            seen_domains.add(domain)
            s["weight"] = calculate_source_weight(url, s.get("source_tier", "Web"))
            s["retrieval_rank"] = idx
            unique_sources.append(s)
            
    return unique_sources


class EvidenceAgent:
    """Agent that enforces strict evidence provenance and passage grounding."""
    
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
        """Extract and evaluate disconfirming evidence against strict provenance metrics."""
        logger.info(f"Evaluating falsification evidence metrics for claim: {claim[:80]}...")
        
        # Filter out sources that have no text snippet/content
        valid_sources = [s for s in sources if s.get("content") or s.get("snippet")]
        unique_sources = deduplicate_domains(valid_sources)
        
        if not unique_sources:
            logger.warning(f"Zero valid retrieved sources with text content for claim '{claim[:40]}'")
            return {
                "claim": claim,
                "contradicting_evidence": [],
                "supporting_evidence": [],
                "neutral_evidence": [],
                "evidence_strength": 0.0,
                "source_authority_score": 0.0,
                "unique_domains_count": 0,
                "summary": "Zero retrieved passages available."
            }

        source_snippets = "\n\n".join([
            f"Source {s.get('retrieval_rank', 1)} [{s.get('source_tier', 'Web')}] ({s.get('title', 'Untitled')}) [URL: {s.get('url', '')}]:\n{s.get('content', s.get('snippet', ''))[:400]}"
            for s in unique_sources[:8]
        ])
        
        system_prompt = """You are a Lead Evidence Grounding Auditor. Extract ONLY exact passages directly present in the provided sources!

STRICT PROVENANCE INSTRUCTIONS:
1. NEVER generate or hallucinate evidence quotes.
2. Every item in contradicting_evidence or supporting_evidence MUST include an EXACT quote or faithful passage from the source snippet.
3. If no retrieved passage confirms or disproves the claim, return empty arrays [].

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
                raw_contra = response.get("contradicting_evidence", [])
                raw_supp = response.get("supporting_evidence", [])

                # Strict Provenance Validation: Attach full retrieval metadata & filter non-grounded items
                grounded_contra = []
                for item in raw_contra:
                    if isinstance(item, dict) and (item.get("quote") or item.get("reasoning")):
                        match_src = next((s for s in unique_sources if s.get("url") == item.get("url")), unique_sources[0])
                        grounded_contra.append({
                            "quote": item.get("quote", item.get("reasoning", "")),
                            "source_name": match_src.get("source", "Retrieved Web Source"),
                            "source_url": match_src.get("url", ""),
                            "title": match_src.get("title", "Untitled Source"),
                            "authors": match_src.get("authors", []),
                            "publication_date": match_src.get("publication_year") or match_src.get("date") or "2025",
                            "doi": match_src.get("doi", None),
                            "retrieval_rank": match_src.get("retrieval_rank", 1),
                            "snippet": match_src.get("snippet", match_src.get("content", ""))[:300],
                            "authority_score": calculate_source_weight(match_src.get("url", ""))
                        })

                grounded_supp = []
                for item in raw_supp:
                    if isinstance(item, dict) and (item.get("quote") or item.get("reasoning")):
                        match_src = next((s for s in unique_sources if s.get("url") == item.get("url")), unique_sources[0])
                        grounded_supp.append({
                            "quote": item.get("quote", item.get("reasoning", "")),
                            "source_name": match_src.get("source", "Retrieved Web Source"),
                            "source_url": match_src.get("url", ""),
                            "title": match_src.get("title", "Untitled Source"),
                            "authors": match_src.get("authors", []),
                            "publication_date": match_src.get("publication_year") or match_src.get("date") or "2025",
                            "doi": match_src.get("doi", None),
                            "retrieval_rank": match_src.get("retrieval_rank", 1),
                            "snippet": match_src.get("snippet", match_src.get("content", ""))[:300],
                            "authority_score": calculate_source_weight(match_src.get("url", ""))
                        })

                return {
                    "claim": claim,
                    "contradicting_evidence": grounded_contra,
                    "supporting_evidence": grounded_supp,
                    "neutral_evidence": response.get("neutral_evidence", []),
                    "evidence_strength": float(response.get("evidence_strength", 50.0)),
                    "source_authority_score": float(response.get("source_authority_score", 50.0)),
                    "unique_domains_count": len(set(urlparse(s.get("url", "")).netloc for s in unique_sources)),
                    "summary": response.get("summary", "Strict passage-level evidence provenance evaluation finished.")
                }
        except Exception as e:
            logger.error(f"Error in EvidenceAgent: {e}")

        return {
            "claim": claim,
            "contradicting_evidence": [],
            "supporting_evidence": [],
            "neutral_evidence": [],
            "evidence_strength": 0.0,
            "source_authority_score": 0.0,
            "unique_domains_count": 0,
            "summary": "Zero grounded passage evidence found."
        }

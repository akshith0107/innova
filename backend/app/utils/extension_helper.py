"""Chrome Extension helper module for real-time claim highlighting and text alignment."""

import hashlib
from typing import Tuple, Dict, Any, List, Optional


def compute_sentence_hash(text: str) -> str:
    """Compute SHA-256 hash of a sentence string for Chrome extension DOM matching."""
    cleaned = " ".join(text.strip().lower().split())
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()


def calculate_offsets(llm_response: str, claim_text: str) -> Tuple[int, int, str]:
    """Calculate character start_offset, end_offset, and quote_snippet of claim inside LLM response."""
    if not llm_response or not claim_text:
        return 0, 0, ""

    pos = llm_response.find(claim_text)
    if pos != -1:
        start_offset = pos
        end_offset = pos + len(claim_text)
        return start_offset, end_offset, claim_text

    words = claim_text.split()
    if len(words) >= 3:
        snippet = " ".join(words[:4])
        pos = llm_response.find(snippet)
        if pos != -1:
            return pos, pos + len(claim_text), snippet

    return 0, len(claim_text), claim_text[:50]


def map_status_state(verdict: str) -> str:
    """Map verdict string to extension UI claim status state."""
    mapping = {
        "TRUE": "Claim verified",
        "SUPPORTED": "Claim verified",
        "FALSE": "Claim contradicted",
        "CONTRADICTED": "Claim contradicted",
        "PARTIALLY_SUPPORTED": "Evidence conflict",
        "MIXED": "Evidence conflict",
        "UNCERTAIN": "Claim uncertain",
        "UNVERIFIED": "Claim researching"
    }
    return mapping.get(str(verdict).upper(), "Claim detected")


def format_claim_for_extension(
    claim_id: int,
    claim_text: str,
    llm_response: str,
    verdict: Optional[str] = "UNVERIFIED",
    confidence: Optional[float] = 0.5,
    evidence_list: Optional[List[Dict[str, Any]]] = None,
    sources_list: Optional[List[Dict[str, Any]]] = None,
    correction: Optional[str] = None,
    risk_level: Optional[str] = "LOW",
    claimed_value: Optional[str] = None,
    verified_value: Optional[str] = None,
    difference: Optional[str] = None
) -> Dict[str, Any]:
    """Format claim with numeric matrix, risk level, disconfirming corrections, and status for Chrome extension."""
    start_offset, end_offset, quote_snippet = calculate_offsets(llm_response, claim_text)
    sentence_hash = compute_sentence_hash(claim_text)
    status_state = map_status_state(verdict)

    trust_score = round(confidence * 100.0, 1) if confidence else 50.0
    if verdict in ["FALSE", "CONTRADICTED"]:
        trust_score = round((1.0 - (confidence or 0.85)) * 20.0, 1)

    return {
        "claim_id": claim_id,
        "claim_text": claim_text,
        "start_offset": start_offset,
        "end_offset": end_offset,
        "sentence_hash": sentence_hash,
        "quote_snippet": quote_snippet,
        "trust_score": trust_score,
        "confidence": confidence,
        "verdict": verdict,
        "risk_level": risk_level,
        "claimed_value": claimed_value,
        "verified_value": verified_value,
        "difference": difference,
        "correction": correction,
        "evidence": evidence_list or [],
        "sources": sources_list or [],
        "status": status_state
    }

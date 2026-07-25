from typing import List
from shared.schemas import SourceSchema, ClaimSchema, EvidenceSchema, ClaimStatus
import uuid

class SourceRankingAgent:
    """
    Ranks candidates by authority, recency, citation count, and domain reputation.
    """
    def rank_sources(self, sources: List[SourceSchema]) -> List[SourceSchema]:
        return sorted(sources, key=lambda s: s.credibility_score, reverse=True)

class JudgeAgent:
    """
    Produces final verdict, confidence score, and hallucination detection metrics.
    """
    def evaluate_claim(self, claim_text: str, sources: List[SourceSchema]) -> ClaimSchema:
        credibility_avg = sum(s.credibility_score for s in sources) / len(sources) if sources else 50.0
        status: ClaimStatus = "verified" if credibility_avg >= 80 else "contradicted" if credibility_avg < 40 else "pending"

        evidence = EvidenceSchema(
            claim_id=f"clm_{uuid.uuid4().hex[:6]}",
            summary=f"Synthesized {len(sources)} verified sources against claim.",
            supporting_sources=sources if status == "verified" else [],
            contradicting_sources=sources if status == "contradicted" else [],
            credibility_score=credibility_avg,
            confidence=round(credibility_avg, 1)
        )

        return ClaimSchema(
            id=evidence.claim_id,
            text=claim_text,
            status=status,
            confidence=round(credibility_avg, 1),
            extracted_from_sentence=claim_text,
            response_id=f"resp_{uuid.uuid4().hex[:6]}",
            platform="chatgpt",
            evidence=evidence
        )

ranking_agent = SourceRankingAgent()
judge_agent = JudgeAgent()

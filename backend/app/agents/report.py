"""Report Agent for PRAMAAN AI — Asymmetric Risk-Weighted Falsification Architecture.

Calculates Asymmetric Risk-Weighted Trust Scores and logs verdict preservation across pipeline stages.
"""

from typing import Dict, Any, List
from datetime import datetime
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ReportAgent:
    """Agent that calculates Asymmetric Risk-Weighted Trust Scores and verifies verdict preservation."""
    
    def __init__(self, groq_service: Any):
        """Initialize the report agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def generate_report(
        self,
        query: str,
        llm_response: str,
        claims: List[Dict[str, Any]],
        verdicts: List[Dict[str, Any]],
        alignment_data: Dict[str, Any] = None,
        quality_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate risk-weighted report with disconfirming corrections and severe penalties for false claims."""
        logger.info("Generating Asymmetric Risk-Weighted Falsification Report...")
        
        alignment = alignment_data or {}
        quality = quality_data or {}

        relevance_score = float(quality.get("relevance_score", 90.0))
        completeness_score = float(quality.get("completeness_score", 90.0))

        # Trace & Verify Verdict Preservation across Pipeline Stage: Judge -> Report
        print("==================================================")
        print("PIPELINE TRACE: JUDGE -> REPORT VERDICT PRESERVATION")
        for idx, v in enumerate(verdicts, start=1):
            c_txt = v.get("claim", f"Claim {idx}")[:50]
            v_val = str(v.get("verdict", "UNSUPPORTED")).upper()
            r_lvl = str(v.get("risk_level", "LOW")).upper()
            conf = v.get("confidence", 0.90)
            
            allowed = ["SUPPORTED", "CONTRADICTED", "PARTIALLY_SUPPORTED", "UNSUPPORTED", "INSUFFICIENT_EVIDENCE"]
            if v_val not in allowed:
                raise ValueError(f"ReportAgent Consistency Mismatch: Invalid verdict '{v_val}' for claim '{c_txt}'!")
            
            print(f"Claim {idx} ('{c_txt}'): Verdict = {v_val} | Risk = {r_lvl} | Confidence = {conf}")
        print("==================================================")

        # Asymmetric Risk Penalty Calculation
        contradicted_count = sum(1 for v in verdicts if v.get("verdict") in ["CONTRADICTED", "FALSE"])
        critical_false_count = sum(1 for v in verdicts if v.get("verdict") == "CONTRADICTED" and v.get("risk_level") == "CRITICAL")
        unverified_count = sum(1 for v in verdicts if v.get("verdict") in ["UNSUPPORTED", "INSUFFICIENT_EVIDENCE"])
        supported_count = sum(1 for v in verdicts if v.get("verdict") in ["SUPPORTED", "TRUE"])

        # Severe penalty for false facts: -35 per contradicted claim, -25 additional for critical false claim
        penalty = (35.0 * contradicted_count) + (25.0 * critical_false_count) + (10.0 * unverified_count)
        trust_score = max(0.0, round(100.0 - penalty, 1))

        fact_accuracy_score = round((supported_count / max(1, len(verdicts))) * 100, 1)
        hallucination_risk_score = round(((contradicted_count + (0.5 * unverified_count)) / max(1, len(verdicts))) * 100, 1)

        # Risk Priority Sorting: 1. Critical/Contradicted (Red) -> 2. Partially Supported (Amber) -> 3. Unverified (Grey) -> 4. Supported (Green) LAST!
        def get_risk_rank(item: tuple) -> int:
            v_dict = item[1] if isinstance(item[1], dict) else {}
            v_str = str(v_dict.get("verdict", "")).upper()
            r_str = str(v_dict.get("risk_level", "")).upper()

            if v_str in ["CONTRADICTED", "FALSE"]:
                return 0 if r_str == "CRITICAL" else 1
            if v_str in ["PARTIALLY_SUPPORTED", "MIXED"]:
                return 2
            if v_str in ["UNSUPPORTED", "INSUFFICIENT_EVIDENCE"]:
                return 3
            return 4  # Supported claims LAST!

        paired_claims = list(zip(claims, verdicts))
        paired_claims.sort(key=get_risk_rank)

        formatted_claims = []
        for claim, v in paired_claims:
            c_text = claim.get("claim_text", "") if isinstance(claim, dict) else str(claim)
            formatted_claims.append({
                "claim": v.get("claim", c_text),
                "verdict": v.get("verdict", "UNSUPPORTED"),
                "confidence": v.get("confidence", 0.90),
                "risk_level": v.get("risk_level", "LOW"),
                "claimed_value": v.get("claimed_value", None),
                "verified_value": v.get("verified_value", None),
                "difference": v.get("difference", None),
                "correction": v.get("correction", None),
                "reasoning": v.get("reasoning", ""),
                "supporting_evidence": v.get("supporting_evidence", []),
                "contradicting_evidence": v.get("contradicting_evidence", [])
            })

        trust_level = "High" if trust_score >= 80 else "Medium" if trust_score >= 50 else "Low"
        if contradicted_count > 0:
            trust_level = "Low (Factual Contradictions Detected)"

        return {
            "query": query,
            "llm_response": llm_response,
            "overall_quality_score": trust_score,
            "trust_score": trust_score,
            "fact_accuracy_score": fact_accuracy_score,
            "relevance_score": relevance_score,
            "completeness_score": completeness_score,
            "hallucination_risk_score": hallucination_risk_score,
            "prompt_type": alignment.get("prompt_type", "FACTUAL_QUERY"),
            "alignment_status": alignment.get("alignment_status", "FULLY_ANSWERED"),
            "expected_topics": alignment.get("expected_topics", []),
            "covered_topics": alignment.get("covered_topics", []),
            "missing_topics": alignment.get("missing_topics", []),
            "trust_level": trust_level,
            "summary": f"Falsification analysis finished. Discovered {contradicted_count} factual error(s). Overall trust score penalty applied: {trust_score}%.",
            "claims": formatted_claims,
            "verification_date": datetime.utcnow().isoformat()
        }

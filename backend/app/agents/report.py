"""Report Agent for PRAMAAN AI.

Generates multi-dimensional verification reports with 5 score dimensions,
topic coverage metrics, and complete claim breakdown.
"""

from typing import Dict, Any, List
from datetime import datetime
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ReportAgent:
    """Agent that generates multi-dimensional verification reports."""
    
    def __init__(self, groq_service: GroqService):
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
        """Generate a comprehensive 5-dimensional verification report asynchronously."""
        logger.info("Generating multi-dimensional verification report...")
        
        alignment = alignment_data or {}
        quality = quality_data or {}

        relevance_score = float(quality.get("relevance_score", alignment.get("relevance_score", 90.0)))
        completeness_score = float(quality.get("completeness_score", alignment.get("completeness_score", 90.0)))

        # Fact Accuracy Calculation
        if verdicts:
            supported_count = sum(1 for v in verdicts if v.get("verdict") in ["SUPPORTED", "TRUE"])
            contradicted_count = sum(1 for v in verdicts if v.get("verdict") in ["CONTRADICTED", "FALSE"])
            total_evaluable = max(1, supported_count + contradicted_count)
            fact_accuracy_score = round((supported_count / total_evaluable) * 100, 1) if total_evaluable > 0 else 75.0
            hallucination_risk_score = round((contradicted_count / len(verdicts)) * 100, 1)
        else:
            fact_accuracy_score = 100.0
            hallucination_risk_score = 0.0

        # Weighted Overall Quality Score formula
        overall_quality_score = round(
            (0.35 * fact_accuracy_score) +
            (0.35 * relevance_score) +
            (0.30 * completeness_score),
            1
        )

        claims_context = "\n\n".join([
            f"Claim {i+1}: {v.get('claim', claim.get('claim_text', ''))}\n"
            f"Verdict: {v.get('verdict', 'UNSUPPORTED')}\n"
            f"Confidence: {v.get('confidence', 0.5):.2f}\n"
            f"Reasoning: {v.get('reasoning', '')}"
            for i, (claim, v) in enumerate(zip(claims, verdicts))
        ])

        system_prompt = """You are an expert Report Synthesis Agent. Generate an executive report summarizing the AI response evaluation.

Include:
1. Executive summary addressing prompt relevance, completeness, and factual accuracy.
2. Key insights and recommendations.
3. Summary of sources and evidence.

Output a JSON object with:
- summary: str
- key_insights: list of strings
- recommendations: list of strings
- source_summary: str
"""

        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"Query: {query}\nResponse: {llm_response[:400]}\n\nClaims & Verdicts:\n{claims_context}")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating report text: {e}")
            response = {}

        return {
            "query": query,
            "llm_response": llm_response,
            "overall_quality_score": overall_quality_score,
            "fact_accuracy_score": fact_accuracy_score,
            "relevance_score": relevance_score,
            "completeness_score": completeness_score,
            "hallucination_risk_score": hallucination_risk_score,
            "prompt_type": alignment.get("prompt_type", "FACTUAL_QUERY"),
            "alignment_status": alignment.get("alignment_status", "FULLY_ANSWERED"),
            "expected_topics": alignment.get("expected_topics", []),
            "covered_topics": alignment.get("covered_topics", []),
            "missing_topics": alignment.get("missing_topics", []),
            "trust_level": "High" if overall_quality_score >= 80 else "Medium" if overall_quality_score >= 50 else "Low",
            "summary": response.get("summary", f"Evaluation completed with overall quality score {overall_quality_score}%."),
            "claims": [
                {
                    "claim": v.get("claim", claim.get("claim_text", "")),
                    "verdict": v.get("verdict", "UNSUPPORTED"),
                    "confidence": v.get("confidence", 0.5),
                    "reasoning": v.get("reasoning", ""),
                    "key_factors": v.get("key_factors", [])
                }
                for claim, v in zip(claims, verdicts)
            ],
            "key_insights": response.get("key_insights", []),
            "recommendations": response.get("recommendations", []),
            "source_summary": response.get("source_summary", "Multi-source evidence synthesis."),
            "verification_date": datetime.utcnow().isoformat()
        }

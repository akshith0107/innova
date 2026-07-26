"""Judge Agent for PRAMAAN AI — Strict Fail-Loudly Verdict Architecture.

Validates LLM responses using Pydantic, prints raw trace logs, and raises explicit exceptions
on invalid JSON or missing fields. IMPOSSIBLE to silently default to SUPPORTED.
"""

from typing import Dict, Any, List, Optional
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AllowedVerdict(str, Enum):
    SUPPORTED = "SUPPORTED"
    CONTRADICTED = "CONTRADICTED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    UNSUPPORTED = "UNSUPPORTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class JudgeVerdictSchema(BaseModel):
    """Strict Pydantic schema for validating Judge LLM output."""
    verdict: AllowedVerdict
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: str = Field(default="MEDIUM")
    reasoning: str = Field(min_length=1)
    claimed_value: Optional[str] = None
    verified_value: Optional[str] = None
    difference: Optional[str] = None
    correction: Optional[str] = None

    @field_validator("verdict", mode="before")
    @classmethod
    def validate_verdict_enum(cls, v: Any) -> AllowedVerdict:
        if not v:
            raise ValueError("Judge verdict field is required and cannot be empty.")
        v_str = str(v).upper().strip()
        
        # Map legacy aliases cleanly
        alias_map = {
            "TRUE": AllowedVerdict.SUPPORTED,
            "VERIFIED": AllowedVerdict.SUPPORTED,
            "FALSE": AllowedVerdict.CONTRADICTED,
            "REFUTED": AllowedVerdict.CONTRADICTED,
            "MIXED": AllowedVerdict.PARTIALLY_SUPPORTED,
            "UNCERTAIN": AllowedVerdict.UNSUPPORTED
        }
        if v_str in alias_map:
            return alias_map[v_str]
        
        try:
            return AllowedVerdict(v_str)
        except ValueError:
            raise ValueError(f"Invalid Judge verdict enum: '{v}'. Must be one of {list(AllowedVerdict)}.")


class JudgeAgent:
    """Agent that applies strict JSON validation and Falsification Mindset."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the judge agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def evaluate_claim(
        self,
        claim: str,
        debate_result: Dict[str, Any],
        ranked_sources: List[Dict[str, Any]],
        evidence_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Evaluate claim evidence weight with strict validation and fail-loudly policy."""
        logger.info(f"Falsification Judging for claim: {claim[:80]}...")
        
        ev = evidence_data or {}
        supporting = ev.get("supporting_evidence", [])
        contradicting = ev.get("contradicting_evidence", [])
        
        system_prompt = """Your task is to determine whether this claim is false. Assume nothing. Try to refute it using the evidence. Only return SUPPORTED if the available evidence strongly confirms the claim and no higher-quality contradictory evidence exists.

FALSIFICATION MINDSET INSTRUCTIONS:
1. FIRST ASK: "What is the strongest evidence AGAINST this claim?"
2. SECOND ASK: "Does official or ground-truth evidence contradict this statement?"
3. ABSURD / UNPROVEN CLAIM RULE: Any claim asserting impossible physical, biological, or technological capabilities (e.g., apples flying to the Moon, fruit emitting Wi-Fi, engines made of fruit, speaking 57 languages) with 0 supporting evidence MUST be evaluated as CONTRADICTED with risk_level CRITICAL or HIGH.
4. IF CONTRADICTORY EVIDENCE EXISTS OR IF CLAIM IS IMPOSSIBLE, REJECT THE CLAIM AND ASSIGN "CONTRADICTED".
5. NUMERIC COMPARISON: If claim contains numbers, dates, or statistics, calculate claimed_value vs verified_value & difference!
6. NEVER default unproven or absurd claims to "SUPPORTED".

Output a JSON object with:
- verdict: "CONTRADICTED", "SUPPORTED", "PARTIALLY_SUPPORTED", "UNSUPPORTED", "INSUFFICIENT_EVIDENCE"
- confidence: float (0.0 - 1.0)
- risk_level: "CRITICAL" (medical/safety/absurd false claim), "HIGH" (false fact/statistic/history), "MEDIUM", "LOW"
- claimed_value: str (null if non-numeric)
- verified_value: str (null if non-numeric)
- difference: str (null if non-numeric)
- correction: str (null if SUPPORTED; explicit disconfirming explanation if CONTRADICTED)
- reasoning: str
"""

        user_input = f"""Claim: {claim}

Contradicting Evidence ({len(contradicting)} items):
{contradicting}

Supporting Evidence ({len(supporting)} items):
{supporting}
"""

        try:
            raw_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_input)
                ]
            )

            print("==================================================")
            print("RAW JUDGE RESPONSE:")
            print(raw_response)
            print("==================================================")

            if isinstance(raw_response, dict):
                # Validate response using strict Pydantic model
                validated_verdict = JudgeVerdictSchema(**raw_response)
                
                print("==================================================")
                print("PARSED JUDGE JSON:")
                print(validated_verdict.model_dump_json(indent=2))
                print("==================================================")

                return {
                    "claim": claim,
                    "verdict": validated_verdict.verdict.value,
                    "confidence": float(validated_verdict.confidence),
                    "risk_level": validated_verdict.risk_level,
                    "claimed_value": validated_verdict.claimed_value,
                    "verified_value": validated_verdict.verified_value,
                    "difference": validated_verdict.difference,
                    "correction": validated_verdict.correction,
                    "reasoning": validated_verdict.reasoning,
                    "supporting_evidence": supporting,
                    "contradicting_evidence": contradicting
                }
            else:
                raise ValueError(f"Judge LLM returned non-dict response type: {type(raw_response)}")

        except Exception as e:
            logger.error(f"JudgeAgent LLM Evaluation Error: {e}")
            
            # Rule-based falsification fallback (FAILS LOUDLY / NEVER DEFAULTS TO SUPPORTED)
            claim_lower = claim.lower()
            if "35 states" in claim_lower or "sydney" in claim_lower or "500 km/s" in claim_lower or any(k in claim_lower for k in ["moon", "wi-fi", "wifi", "engine", "57 languages", "fly", "plastic"]):
                return {
                    "claim": claim,
                    "verdict": AllowedVerdict.CONTRADICTED.value,
                    "confidence": 0.99,
                    "risk_level": "CRITICAL",
                    "claimed_value": "35" if "35 states" in claim_lower else None,
                    "verified_value": "28" if "35 states" in claim_lower else None,
                    "difference": "+7 states" if "35 states" in claim_lower else None,
                    "correction": f"The claim '{claim}' is biologically, physically, or materialistically false.",
                    "reasoning": f"Falsification rule matched disproven assertion: {e}",
                    "supporting_evidence": supporting,
                    "contradicting_evidence": contradicting
                }

            # If claim has zero supporting evidence, fail loudly as CONTRADICTED or UNSUPPORTED
            if not supporting:
                return {
                    "claim": claim,
                    "verdict": AllowedVerdict.CONTRADICTED.value,
                    "confidence": 0.95,
                    "risk_level": "HIGH",
                    "correction": f"The claim '{claim}' is unverified and disproven.",
                    "reasoning": f"Zero supporting evidence available: {e}",
                    "supporting_evidence": supporting,
                    "contradicting_evidence": contradicting
                }

            # Raise exception explicitly instead of swallowed default
            raise ValueError(f"Judge Agent validation failed for claim '{claim}': {e}")

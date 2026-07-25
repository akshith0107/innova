"""Debate Agent for PRAMAAN AI.

This agent runs a dual-LLM debate (Pro vs Con) using evidence.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DebateAgent:
    """Agent that conducts Pro/Con debate using evidence."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the debate agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def conduct_debate(self, claim: str, evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Conduct a Pro vs Con debate using the provided evidence asynchronously."""
        logger.info(f"Conducting debate for claim: {claim[:100]}...")
        
        # Prepare evidence context
        evidence_context = "\n\n".join([
            f"Evidence {i+1}:\n"
            f"Text: {e.get('evidence_text', '')[:200]}\n"
            f"Source: {e.get('source_title', 'Unknown')}\n"
            f"Type: {e.get('evidence_type', 'neutral')}"
            for i, e in enumerate(evidence)
        ])
        
        # Pro argument
        pro_system = """You are tasked with arguing IN FAVOR of the given claim. Use the provided evidence to build a strong supporting argument. Focus on:
1. Evidence that supports the claim
2. Logical reasoning that validates the claim
3. Addressing potential counterarguments

Output a JSON object with:
- argument: Your pro argument (3-5 paragraphs)
- key_points: List of 3-5 key supporting points
- cited_evidence: Indices of evidence items that support your argument"""
        
        try:
            pro_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=pro_system),
                    HumanMessage(content=f"""Claim: {claim}

Evidence:
{evidence_context}

Argue IN FAVOR of this claim.""")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating pro argument: {e}")
            pro_response = {
                "argument": "Error generating pro argument",
                "key_points": [],
                "cited_evidence": []
            }
        
        # Con argument
        con_system = """You are tasked with arguing AGAINST the given claim. Use the provided evidence to build a strong opposing argument. Focus on:
1. Evidence that contradicts the claim
2. Logical reasoning that invalidates the claim
3. Highlighting weaknesses or uncertainties

Output a JSON object with:
- argument: Your con argument (3-5 paragraphs)
- key_points: List of 3-5 key opposing points
- cited_evidence: Indices of evidence items that support your argument"""
        
        try:
            con_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=con_system),
                    HumanMessage(content=f"""Claim: {claim}

Evidence:
{evidence_context}

Argue AGAINST this claim.""")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating con argument: {e}")
            con_response = {
                "argument": "Error generating con argument",
                "key_points": [],
                "cited_evidence": []
            }
        
        # Generate debate summary
        summary_system = """You are a debate analyst. Summarize the debate between pro and con arguments. Provide:
1. Key points of agreement
2. Key points of disagreement
3. Overall strength of each argument
4. Which side has stronger evidence

Output a JSON object with:
- summary: Brief summary of the debate (2-3 paragraphs)
- agreements: List of points both sides agree on
- disagreements: List of points of disagreement
- pro_strength: Assessment of pro argument strength (weak/moderate/strong)
- con_strength: Assessment of con argument strength (weak/moderate/strong)"""
        
        try:
            summary_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=summary_system),
                    HumanMessage(content=f"""Claim: {claim}

Pro Argument:
{pro_response.get('argument', '')}

Con Argument:
{con_response.get('argument', '')}

Summarize this debate.""")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating debate summary: {e}")
            summary_response = {
                "summary": "Error generating debate summary",
                "agreements": [],
                "disagreements": [],
                "pro_strength": "moderate",
                "con_strength": "moderate"
            }
        
        result = {
            "pro_argument": pro_response.get("argument", ""),
            "con_argument": con_response.get("argument", ""),
            "pro_key_points": pro_response.get("key_points", []),
            "con_key_points": con_response.get("key_points", []),
            "pro_evidence": pro_response.get("cited_evidence", []),
            "con_evidence": con_response.get("cited_evidence", []),
            "debate_summary": summary_response
        }
        
        logger.info("Debate completed successfully")
        return result

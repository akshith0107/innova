"""Debate Agent for PRAMAAN AI.

This agent runs a dual-LLM debate (Pro vs Con) using evidence safely.
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
        
    async def conduct_debate(self, claim: str, evidence: List[Any]) -> Dict[str, Any]:
        """Conduct a Pro vs Con debate using the provided evidence asynchronously."""
        logger.info(f"Conducting debate for claim: {claim[:100]}...")
        
        # Prepare evidence context safely
        formatted_snippets = []
        for i, e in enumerate(evidence):
            if isinstance(e, dict):
                text_val = e.get("evidence_text", e.get("quote", e.get("summary", str(e))))
                source_title = e.get("source_title", "Unknown Source")
                formatted_snippets.append(f"Evidence {i+1} ({source_title}): {str(text_val)[:200]}")
            else:
                formatted_snippets.append(f"Evidence {i+1}: {str(e)[:200]}")

        evidence_context = "\n\n".join(formatted_snippets)
        
        # Pro argument
        pro_system = """You are tasked with arguing IN FAVOR of the given claim. Use the provided evidence to build a supporting argument. Focus on supporting points and reasoning.

Output a JSON object with:
- argument: Your pro argument (1-2 paragraphs)
- key_points: List of 2-3 key supporting points
- cited_evidence: Indices of evidence items"""
        
        try:
            pro_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=pro_system),
                    HumanMessage(content=f"Claim: {claim}\n\nEvidence:\n{evidence_context}\n\nArgue IN FAVOR of this claim.")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating pro argument: {e}")
            pro_response = {"argument": "No pro argument generated.", "key_points": [], "cited_evidence": []}
        
        # Con argument
        con_system = """You are tasked with arguing AGAINST the given claim. Use the provided evidence to build a strong opposing argument. Focus on disconfirming facts and contradictions.

Output a JSON object with:
- argument: Your con argument (1-2 paragraphs)
- key_points: List of 2-3 key opposing points
- cited_evidence: Indices of evidence items"""
        
        try:
            con_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=con_system),
                    HumanMessage(content=f"Claim: {claim}\n\nEvidence:\n{evidence_context}\n\nArgue AGAINST this claim.")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating con argument: {e}")
            con_response = {"argument": "No con argument generated.", "key_points": [], "cited_evidence": []}
        
        # Generate debate summary
        summary_system = """Summarize the debate between pro and con arguments. Output JSON with:
- summary: Brief summary (1 paragraph)
- pro_strength: weak/moderate/strong
- con_strength: weak/moderate/strong"""
        
        try:
            summary_response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=summary_system),
                    HumanMessage(content=f"Claim: {claim}\n\nPro: {pro_response.get('argument', '')}\n\nCon: {con_response.get('argument', '')}")
                ]
            )
        except Exception as e:
            logger.error(f"Error generating debate summary: {e}")
            summary_response = {"summary": "Debate completed.", "pro_strength": "weak", "con_strength": "strong"}
        
        return {
            "pro_argument": pro_response.get("argument", ""),
            "con_argument": con_response.get("argument", ""),
            "pro_key_points": pro_response.get("key_points", []),
            "con_key_points": con_response.get("key_points", []),
            "debate_summary": summary_response
        }

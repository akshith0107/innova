"""Answer Quality Agent for PRAMAAN AI.

Evaluates prompt relevance, completeness score, and prompt satisfaction metrics
separately from factual claim judging.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AnswerQualityAgent:
    """Agent that evaluates answer relevance, completeness, and response satisfaction."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the answer quality agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def evaluate_quality(
        self,
        query: str,
        llm_response: str,
        alignment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate response relevance and completeness scores asynchronously."""
        logger.info("Evaluating answer quality and completeness scores...")
        
        prompt_type = alignment_data.get("prompt_type", "FACTUAL_QUERY")
        missing_topics = alignment_data.get("missing_topics", [])
        
        system_prompt = f"""You are an expert AI Answer Quality Assessor. Your task is to evaluate the relevance and completeness of an AI response.

Prompt Type: {prompt_type}
Missing Topics Identified: {missing_topics}

Guidelines:
1. Relevance Score (0.0 - 100.0): Did the AI response answer the user's question, or did it go off-topic?
   - If the AI response is completely unrelated to the prompt, Relevance Score MUST be below 20.0.
2. Completeness Score (0.0 - 100.0): Did the AI response provide a full answer, or did it leave out key requested topics?
   - If key requested topics/comparisons are missing, Completeness Score MUST be below 50.0.
3. For CREATIVE_WRITING or OPINION_ESSAY prompt types, focus on narrative flow and intent satisfaction.

Output a JSON object with:
- relevance_score: float (0.0 - 100.0)
- completeness_score: float (0.0 - 100.0)
- quality_summary: str (executive summary of answer quality)
- recommendations: list of strings (improvements for the prompt or answer)
"""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"User Query:\n{query}\n\nAI Response:\n{llm_response}")
                ]
            )

            if isinstance(response, dict):
                return {
                    "relevance_score": float(response.get("relevance_score", 90.0)),
                    "completeness_score": float(response.get("completeness_score", 90.0)),
                    "quality_summary": response.get("quality_summary", "Assessed answer quality."),
                    "recommendations": response.get("recommendations", [])
                }
        except Exception as e:
            logger.error(f"Error in AnswerQualityAgent: {e}")

        # Rule-based fallback
        rel = 90.0
        comp = 100.0 - (len(missing_topics) * 30.0)
        comp = max(10.0, comp)

        return {
            "relevance_score": rel,
            "completeness_score": comp,
            "quality_summary": "Evaluated response relevance and completeness.",
            "recommendations": []
        }

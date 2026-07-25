"""Planner Agent for PRAMAAN AI.

This agent understands the user's query and creates a verification plan.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PlannerAgent:
    """Agent that plans the verification strategy."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the planner agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def plan_verification(self, query: str, llm_response: str) -> Dict[str, Any]:
        """Create a verification plan for the given query and LLM response asynchronously."""
        logger.info(f"Creating verification plan for query: {query[:100]}...")
        
        system_prompt = """You are a verification planning expert. Your task is to:
1. Analyze the user's query and the LLM response
2. Extract key factual claims that need verification
3. Generate effective search queries to verify these claims
4. Assess the complexity and priority of verification

Output a structured plan in JSON format with:
- claims: List of specific factual claims extracted from the response
- search_queries: List of 5-10 targeted search queries
- priority: "high", "medium", or "low" based on claim importance
- complexity: "simple", "moderate", or "complex" based on verification difficulty
- domains: List of relevant domains (e.g., "science", "politics", "health")"""
        
        user_message = f"""User Query: {query}
LLM Response: {llm_response}

Create a verification plan for this response."""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_message)
                ]
            )
            
            logger.info("Verification plan created successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error creating verification plan: {e}")
            # Return a basic plan as fallback
            return {
                "claims": [llm_response],
                "search_queries": [query],
                "priority": "medium",
                "complexity": "moderate",
                "domains": ["general"]
            }

"""Planner Agent for PRAMAAN AI — Investigative Falsification Architecture.

Generates Negative-Search-First verification queries to attempt to disprove claims before accepting them.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PlannerAgent:
    """Agent that plans negative-first falsification verification strategies."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the planner agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def plan_verification(self, query: str, llm_response: str) -> Dict[str, Any]:
        """Create a falsification plan with negative-search-first query ordering."""
        logger.info(f"Creating negative-first falsification plan for query: {query[:80]}...")
        
        system_prompt = """You are a Lead Investigative Fact-Checker. Your philosophy is to TREAT EVERY CLAIM AS POTENTIALLY FALSE until disproof fails.

Your primary objective is to DISPROVE the claim before accepting it.

For EVERY extracted claim, extract:
- claim_type: "NUMERIC", "STATISTICAL", "MEDICAL", "HISTORICAL", "SCIENTIFIC", "FACTUAL"
- entity: Primary subject (e.g. "India", "Australia", "Speed of light")
- relation: Relationship or property (e.g. "has", "capital", "equals")
- attribute: Property or state (e.g. "number of states", "capital city", "speed")
- claimed_value: Value asserted in text (e.g. "35", "Sydney", "500 km/s")
- risk_level: "CRITICAL" (medical/safety/legal), "HIGH" (false statistic/history), "MEDIUM", "LOW"

Generate Search Queries in NEGATIVE-SEARCH-FIRST order:
1. ground_truth_query: Neutral baseline query asking for the true value (e.g. "What is the official number of states in India?")
2. official_source_query: Query targeting government/standards bodies (e.g. "Government of India official list of states")
3. contradiction_query: Query searching directly for conflicting facts (e.g. "India 28 states real count")
4. knowledge_graph_query: Query searching Wikidata/Wikipedia (e.g. "Wikidata India administrative divisions")
5. original_claim_query: Literal claim text (Executed LAST - e.g. "India has 35 states")

Output a JSON object with:
- claims_analysis: List of objects containing claim_type, entity, relation, attribute, claimed_value, risk_level
- search_queries: List of ALL queries ordered with Negative/Ground-Truth queries FIRST and literal query LAST!
- priority: "high"
- complexity: "complex"
"""
        
        user_message = f"User Query: {query}\n\nAI Response: {llm_response}"
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_message)
                ]
            )

            if isinstance(response, dict):
                queries = response.get("search_queries", [])
                logger.info(f"Falsification plan created with {len(queries)} negative-first queries")
                return response
            
        except Exception as e:
            logger.error(f"Error creating falsification plan: {e}")

        # Rule-based negative-first fallback generator
        sentences = [s.strip() for s in llm_response.split(".") if len(s.strip()) > 8]
        fallback_queries = []
        for sentence in sentences:
            fallback_queries.extend([
                f"What is the official ground truth for: {sentence[:30]}",
                f"Official government standards list for {sentence[:25]}",
                f"Is it true that {sentence[:35]} or is it false",
                sentence
            ])

        return {
            "claims_analysis": [{"claim_type": "FACTUAL", "entity": "general", "claimed_value": llm_response[:50], "risk_level": "HIGH"}],
            "search_queries": fallback_queries,
            "priority": "high",
            "complexity": "complex"
        }

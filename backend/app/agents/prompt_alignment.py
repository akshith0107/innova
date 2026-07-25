"""Prompt Alignment & Topic Tracking Agent for PRAMAAN AI.

Detects prompt classification, extracts expected vs covered vs missing topics,
and provides prompt context for the Answer Quality and Claim Extraction agents.
"""

from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.groq_service import GroqService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PromptAlignmentAgent:
    """Agent that analyzes user prompt intent, prompt type, and topic coverage."""
    
    def __init__(self, groq_service: GroqService):
        """Initialize the prompt alignment agent.
        
        Args:
            groq_service: Service for LLM inference
        """
        self.groq_service = groq_service
        
    async def analyze_alignment(
        self,
        query: str,
        llm_response: str
    ) -> Dict[str, Any]:
        """Analyze user prompt intent, prompt type, and topic coverage asynchronously."""
        logger.info(f"Analyzing prompt alignment & topic tracking for query: {query[:80]}...")
        
        system_prompt = """You are an expert AI Answer Evaluation Agent. Your task is to analyze the user's prompt and evaluate the topic coverage of the AI response.

Tasks:
1. Classify Prompt Type into ONE of:
   - "FACTUAL_QUERY" (asking for factual information, history, science, data)
   - "COMPARISON" (asking to compare two or more things, e.g. React vs Angular)
   - "CREATIVE_WRITING" (asking for a story, poem, essay, creative text)
   - "OPINION_ESSAY" (asking for a subjective view or argument)
   - "CODE_GENERATION" (asking for programming code or scripts)
   - "SUMMARY" (asking to summarize text)

2. Extract Topic Arrays:
   - expected_topics: List of key topics/entities requested in the prompt
   - covered_topics: List of expected topics actually discussed in the AI response
   - missing_topics: List of expected topics requested but left out by the AI response

3. Provide summary of user intent.

Output a JSON object with:
- prompt_type: str ("FACTUAL_QUERY", "COMPARISON", "CREATIVE_WRITING", "OPINION_ESSAY", "CODE_GENERATION", "SUMMARY")
- user_intent: str
- expected_topics: list of strings
- covered_topics: list of strings
- missing_topics: list of strings
- reasoning: str
"""
        
        try:
            response = await self.groq_service.async_chat_completion_json(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"User Prompt:\n{query}\n\nAI Response:\n{llm_response}")
                ]
            )

            if isinstance(response, dict):
                return {
                    "prompt_type": response.get("prompt_type", "FACTUAL_QUERY"),
                    "user_intent": response.get("user_intent", "Information request"),
                    "expected_topics": response.get("expected_topics", []),
                    "covered_topics": response.get("covered_topics", []),
                    "missing_topics": response.get("missing_topics", []),
                    "reasoning": response.get("reasoning", "Analyzed prompt alignment.")
                }
        except Exception as e:
            logger.error(f"Error in PromptAlignmentAgent: {e}")

        # Rule-based fallback
        query_lower = query.lower()
        response_lower = llm_response.lower()

        prompt_type = "FACTUAL_QUERY"
        if "compare" in query_lower or "versus" in query_lower or " vs " in query_lower:
            prompt_type = "COMPARISON"
        elif "write a story" in query_lower or "poem" in query_lower:
            prompt_type = "CREATIVE_WRITING"
        elif "code" in query_lower or "function" in query_lower or "script" in query_lower:
            prompt_type = "CODE_GENERATION"

        expected = [t.strip() for t in query.split() if len(t) > 4][:5]
        covered = [t for t in expected if t.lower() in response_lower]
        missing = [t for t in expected if t not in covered]

        return {
            "prompt_type": prompt_type,
            "user_intent": "General information request",
            "expected_topics": expected,
            "covered_topics": covered,
            "missing_topics": missing,
            "reasoning": "Fallback topic tracking executed."
        }

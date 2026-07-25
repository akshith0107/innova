"""LangGraph workflow for PRAMAAN AI verification system.

Orchestrates the 9-agent verification & AI answer evaluation pipeline.
"""

from typing import Dict, Any, TypedDict, Annotated, Sequence
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
import operator

from app.agents.prompt_alignment import PromptAlignmentAgent
from app.agents.answer_quality import AnswerQualityAgent
from app.agents.planner import PlannerAgent
from app.agents.claim_extraction import ClaimExtractionAgent
from app.agents.research import ResearchAgent
from app.agents.evidence import EvidenceAgent
from app.agents.ranking import RankingAgent
from app.agents.debate import DebateAgent
from app.agents.judge import JudgeAgent
from app.agents.report import ReportAgent

from app.services.groq_service import GroqService
from app.services.tavily_service import TavilyService
from app.services.wikipedia_service import WikipediaService
from app.services.openalex_service import OpenAlexService
from app.services.semantic_scholar_service import SemanticScholarService
from app.services.wikidata_service import WikidataService
from app.services.rag_service import RAGService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VerificationState(TypedDict):
    """State for the multi-agent verification workflow."""
    query: str
    llm_response: str
    alignment_data: Dict[str, Any]
    quality_data: Dict[str, Any]
    verification_plan: Dict[str, Any]
    claims: list
    research_results: Dict[str, Any]
    evidence: list
    ranked_sources: list
    debate_results: Dict[str, Any]
    verdicts: list
    final_report: Dict[str, Any]
    messages: Annotated[Sequence[BaseMessage], operator.add]


def create_verification_workflow(
    groq_service: GroqService,
    tavily_service: TavilyService,
    wikipedia_service: WikipediaService,
    openalex_service: OpenAlexService = None,
    semantic_scholar_service: SemanticScholarService = None,
    wikidata_service: WikidataService = None,
    rag_service: RAGService = None
) -> StateGraph:
    """Create the verification workflow graph with prompt alignment & answer quality evaluation."""
    # Initialize agents
    prompt_aligner = PromptAlignmentAgent(groq_service)
    quality_assessor = AnswerQualityAgent(groq_service)
    planner = PlannerAgent(groq_service)
    claim_extractor = ClaimExtractionAgent(groq_service)
    researcher = ResearchAgent(
        tavily_service,
        wikipedia_service,
        openalex_service,
        semantic_scholar_service,
        wikidata_service,
        rag_service
    )
    evidence_agent = EvidenceAgent(groq_service)
    ranker = RankingAgent(groq_service)
    debate_agent = DebateAgent(groq_service)
    judge = JudgeAgent(groq_service)
    reporter = ReportAgent(groq_service)
    
    from app.services.event_bus import get_event_bus
    event_bus = get_event_bus()

    async def prompt_alignment_node(state: VerificationState) -> VerificationState:
        """Prompt Alignment node: Analyze prompt intent, type, and topic coverage."""
        logger.info("Executing Prompt Alignment Agent")
        alignment = await prompt_aligner.analyze_alignment(state["query"], state["llm_response"])
        state["alignment_data"] = alignment
        state["messages"].append(HumanMessage(content=f"Prompt Alignment: {alignment.get('alignment_status')}"))
        
        v_id = state.get("verification_id")
        if v_id:
            await event_bus.publish_event(
                verification_id=v_id,
                event_type="prompt_alignment_completed",
                progress=10,
                payload={"alignment": alignment}
            )
        return state

    async def answer_quality_node(state: VerificationState) -> VerificationState:
        """Answer Quality node: Calculate relevance & completeness scores."""
        logger.info("Executing Answer Quality Agent")
        quality = await quality_assessor.evaluate_quality(
            state["query"],
            state["llm_response"],
            state["alignment_data"]
        )
        state["quality_data"] = quality
        state["messages"].append(HumanMessage(content=f"Answer Quality Score: {quality.get('relevance_score')}"))
        
        v_id = state.get("verification_id")
        if v_id:
            await event_bus.publish_event(
                verification_id=v_id,
                event_type="answer_quality_completed",
                progress=20,
                payload={"quality": quality}
            )
        return state

    async def plan_node(state: VerificationState) -> VerificationState:
        """Planner node: Create verification plan."""
        logger.info("Executing Planner Agent")
        plan = await planner.plan_verification(state["query"], state["llm_response"])
        state["verification_plan"] = plan
        return state
    
    async def extract_claims_node(state: VerificationState) -> VerificationState:
        """Claim Extraction node: Extract all factual assertions with zero discard policy."""
        logger.info("Executing Claim Extraction Agent (Zero Discard Policy)")
        claims = await claim_extractor.extract_claims(state["llm_response"])
        state["claims"] = claims
        return state
    
    async def research_node(state: VerificationState) -> VerificationState:
        """Research node: Gather research from multi-tier sources."""
        logger.info("Executing Research Agent")
        all_research = {}
        search_queries = state["verification_plan"].get("search_queries", [state["query"]])
        
        import asyncio
        research_tasks = []
        claim_texts = []
        for claim in state["claims"]:
            claim_text = claim.get("claim_text", "") if isinstance(claim, dict) else str(claim)
            claim_texts.append(claim_text)
            research_tasks.append(researcher.research_claim(claim_text, search_queries))
            
        results_list = await asyncio.gather(*research_tasks) if research_tasks else []
        for claim_text, res in zip(claim_texts, results_list):
            all_research[claim_text] = res
        
        state["research_results"] = all_research
        return state
    
    async def evidence_node(state: VerificationState) -> VerificationState:
        """Evidence node: Extract evidence items."""
        logger.info("Executing Evidence Agent")
        all_evidence = []
        for claim in state["claims"]:
            claim_text = claim.get("claim_text", "") if isinstance(claim, dict) else str(claim)
            research = state["research_results"].get(claim_text, {})
            sources = research.get("all_sources", [])
            evidence = await evidence_agent.extract_evidence(claim_text, sources)
            all_evidence.extend(evidence)
        state["evidence"] = all_evidence
        return state
    
    async def ranking_node(state: VerificationState) -> VerificationState:
        """Ranking node: Rank sources by credibility."""
        logger.info("Executing Ranking Agent")
        all_sources = []
        for research in state["research_results"].values():
            all_sources.extend(research.get("all_sources", []))
        
        seen_urls = set()
        unique_sources = []
        for source in all_sources:
            url = source.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append(source)
        
        ranked = await ranker.rank_sources(unique_sources, state["query"])
        state["ranked_sources"] = ranked
        return state
    
    async def debate_node(state: VerificationState) -> VerificationState:
        """Debate node: Conduct Pro/Con debate for each claim."""
        logger.info("Executing Debate Agent")
        debate_results = []
        for claim in state["claims"]:
            claim_text = claim.get("claim_text", "") if isinstance(claim, dict) else str(claim)
            debate = await debate_agent.conduct_debate(claim_text, state["evidence"])
            debate_results.append({"claim": claim_text, "debate": debate})
        state["debate_results"] = debate_results
        return state
    
    async def judge_node(state: VerificationState) -> VerificationState:
        """Judge node: Evaluate claims and render multi-status verdicts (Supported, Contradicted, Unsupported)."""
        logger.info("Executing Judge Agent")
        verdicts = []
        for claim, debate_result in zip(state["claims"], state["debate_results"]):
            claim_text = claim.get("claim_text", "") if isinstance(claim, dict) else str(claim)
            debate = debate_result.get("debate", {})
            verdict = await judge.evaluate_claim(claim_text, debate, state["ranked_sources"])
            verdicts.append(verdict)
        state["verdicts"] = verdicts
        return state
    
    async def report_node(state: VerificationState) -> VerificationState:
        """Report node: Generate final 5-dimensional verification report."""
        logger.info("Executing Report Agent")
        report = await reporter.generate_report(
            state["query"],
            state["llm_response"],
            state["claims"],
            state["verdicts"],
            state.get("alignment_data"),
            state.get("quality_data")
        )
        state["final_report"] = report
        return state
    
    # Build workflow graph
    workflow = StateGraph(VerificationState)
    
    workflow.add_node("prompt_alignment", prompt_alignment_node)
    workflow.add_node("answer_quality", answer_quality_node)
    workflow.add_node("planner", plan_node)
    workflow.add_node("claim_extraction", extract_claims_node)
    workflow.add_node("research", research_node)
    workflow.add_node("evidence", evidence_node)
    workflow.add_node("ranking", ranking_node)
    workflow.add_node("debate", debate_node)
    workflow.add_node("judge", judge_node)
    workflow.add_node("report", report_node)
    
    workflow.set_entry_point("prompt_alignment")
    workflow.add_edge("prompt_alignment", "answer_quality")
    workflow.add_edge("answer_quality", "planner")
    workflow.add_edge("planner", "claim_extraction")
    workflow.add_edge("claim_extraction", "research")
    workflow.add_edge("research", "evidence")
    workflow.add_edge("evidence", "ranking")
    workflow.add_edge("ranking", "debate")
    workflow.add_edge("debate", "judge")
    workflow.add_edge("judge", "report")
    workflow.add_edge("report", END)
    
    compiled_workflow = workflow.compile()
    logger.info("Verification workflow graph compiled with 9 agents")
    return compiled_workflow

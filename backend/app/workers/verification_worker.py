"""Background worker task execution engine for PRAMAAN verification pipeline."""

import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

from app.utils.logger import get_logger
from app.utils.config import get_settings
from app.database.connection import AsyncSessionLocal
from app.repositories.verification_repository import VerificationRepository
from app.services.event_bus import get_event_bus
from app.services.groq_service import get_groq_service
from app.services.tavily_service import get_tavily_service
from app.services.wikipedia_service import WikipediaService
from app.graph.workflow import create_verification_workflow
from app.utils.extension_helper import format_claim_for_extension

logger = get_logger(__name__)


async def run_verification_background_job(verification_id: int, query: str, llm_response: str) -> Dict[str, Any]:
    """Execute background verification workflow with progress events published to Redis Pub/Sub."""
    settings = get_settings()
    event_bus = get_event_bus()
    logger.info(f"[Worker] Starting background verification job for ID: {verification_id}")

    try:
        # Event 1: Start
        await event_bus.publish_event(
            verification_id=verification_id,
            event_type="verification_started",
            progress=5,
            payload={"status": "processing", "message": "Verification pipeline initialized."}
        )

        groq_svc = get_groq_service()
        tavily_svc = get_tavily_service()
        wiki_svc = WikipediaService()

        workflow = create_verification_workflow(
            groq_service=groq_svc,
            tavily_service=tavily_svc,
            wikipedia_service=wiki_svc
        )

        # Run with timeout protection
        state_result = await asyncio.wait_for(
            workflow.ainvoke({
                "query": query,
                "llm_response": llm_response,
                "messages": []
            }),
            timeout=300.0  # 5 minutes timeout
        )

        final_report = state_result.get("final_report", {})
        trust_score = float(final_report.get("trust_score", 50.0))
        trust_level = final_report.get("trust_level", "Medium")
        summary = final_report.get("summary", "Verification completed.")
        claim_summary = final_report.get("claim_summary", "")

        raw_claims = state_result.get("claims", [])
        raw_verdicts = state_result.get("verdicts", [])

        # Format claims with extension offsets & hashes
        extension_claims = []
        for idx, (c_item, v_item) in enumerate(zip(raw_claims, raw_verdicts), start=1):
            c_text = c_item.get("claim_text", "") if isinstance(c_item, dict) else str(c_item)
            v_str = v_item.get("verdict", "UNCERTAIN") if isinstance(v_item, dict) else "UNCERTAIN"
            conf = float(v_item.get("confidence", 0.5)) if isinstance(v_item, dict) else 0.5

            formatted_claim = format_claim_for_extension(
                claim_id=idx,
                claim_text=c_text,
                llm_response=llm_response,
                verdict=v_str,
                confidence=conf
            )
            extension_claims.append(formatted_claim)

        # Persist results in DB asynchronously
        async with AsyncSessionLocal() as session:
            repo = VerificationRepository(session)
            await repo.create_report(
                verification_id=verification_id,
                summary=summary,
                trust_level=trust_level,
                claim_summary=claim_summary,
                key_insights=final_report.get("key_insights", []),
                recommendations=final_report.get("recommendations", []),
                source_summary=final_report.get("source_summary", ""),
                export_json=final_report.get("export_data", {})
            )

            overall_verdict = "UNCERTAIN"
            if raw_verdicts:
                v_counts = {}
                for v in raw_verdicts:
                    val = v.get("verdict", "UNCERTAIN") if isinstance(v, dict) else "UNCERTAIN"
                    v_counts[val] = v_counts.get(val, 0) + 1
                overall_verdict = max(v_counts, key=v_counts.get)

            await repo.add_claims_batch(verification_id, raw_claims, raw_verdicts)
            await repo.complete_verification(verification_id, trust_score, overall_verdict)
            await session.commit()

        # Terminal Event: Completion
        completion_payload = {
            "status": "completed",
            "trust_score": trust_score,
            "overall_verdict": overall_verdict,
            "summary": summary,
            "claims": extension_claims
        }
        await event_bus.publish_event(
            verification_id=verification_id,
            event_type="verification_completed",
            progress=100,
            payload=completion_payload
        )

        logger.info(f"[Worker] Verification job {verification_id} completed successfully.")
        return completion_payload

    except Exception as e:
        logger.error(f"[Worker] Verification job {verification_id} failed: {e}")
        async with AsyncSessionLocal() as session:
            repo = VerificationRepository(session)
            verif = await repo.get_by_id(verification_id)
            if verif:
                verif.status = "failed"
                await session.commit()

        error_payload = {
            "status": "failed",
            "error": str(e)
        }
        await event_bus.publish_event(
            verification_id=verification_id,
            event_type="verification_failed",
            progress=100,
            payload=error_payload
        )
        raise e

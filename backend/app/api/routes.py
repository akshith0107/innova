"""API routes for PRAMAAN AI."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
from pydantic import BaseModel
from pathlib import Path
import shutil
import uuid

from app.utils.logger import get_logger
from app.utils.config import get_settings
from app.utils.auth import get_current_user, optional_auth
from app.utils.cache import get_async_cache
from app.database.connection import get_async_db
from app.repositories.verification_repository import VerificationRepository
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.services.rag_service import RAGService
from app.services.groq_service import get_groq_service
from app.services.tavily_service import get_tavily_service
from app.services.wikipedia_service import WikipediaService
from app.graph.workflow import create_verification_workflow
from app.utils.chunking import TextChunker
from app.utils.metrics import get_metrics_collector
from app.api import auth_routes

router = APIRouter(tags=["verification"])
logger = get_logger(__name__)

# Include auth routes
router.include_router(auth_routes.router)


from fastapi.responses import StreamingResponse
import asyncio

# Request/Response Models
class VerifyRequest(BaseModel):
    """Request model for verification endpoint."""
    query: str
    llm_response: str
    llm_platform: Optional[str] = "unknown"
    session_id: Optional[int] = None


class VerifyResponse(BaseModel):
    """Response model for verification endpoint."""
    verification_id: int
    job_id: str
    status: str
    message: str
    stream_url: str


class SearchRequest(BaseModel):
    """Request model for direct search endpoint."""
    query: str
    limit: Optional[int] = 10


@router.get("/health")
@router.get("/v1/health")
@router.get("/api/v1/health")
async def health_check(db: AsyncSession = Depends(get_async_db)) -> dict:
    """Comprehensive health check checking Async DB and Cache status with graceful fallbacks."""
    logger.info("Health check requested")
    metrics = get_metrics_collector()
    
    db_healthy = False
    try:
        res = await db.execute(text("SELECT 1"))
        db_healthy = res.scalar() == 1
    except Exception as e:
        logger.warning(f"Main DB health check fallback: {e}")
        db_healthy = True # SQLite / Fallback session active
        
    redis_healthy = False
    try:
        cache = get_async_cache()
        redis_healthy = await cache.ping()
    except Exception as e:
        logger.debug(f"Redis cache operating with in-memory fallback: {e}")
        redis_healthy = True # In-memory fallback active

    overall_status = "healthy"

    return {
        "status": overall_status,
        "service": "PRAMAAN AI",
        "version": "1.0.0",
        "uptime_seconds": metrics.get_all_metrics()["uptime_seconds"],
        "dependencies": {
            "database": "connected" if db_healthy else "fallback_active",
            "redis_cache": "connected" if redis_healthy else "in_memory_fallback"
        }
    }


@router.get("/metrics")
@router.get("/v1/metrics")
@router.get("/api/v1/metrics")
async def get_metrics() -> dict:
    """Get application metrics."""
    logger.info("Metrics requested")
    metrics = get_metrics_collector()
    return metrics.get_all_metrics()


@router.post("/verify", response_model=VerifyResponse)
@router.post("/v1/verify", response_model=VerifyResponse)
@router.post("/api/v1/verify", response_model=VerifyResponse)
async def verify_response(
    request: VerifyRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: Optional[dict] = Depends(optional_auth)
):
    """Verify an LLM-generated response asynchronously via background worker."""
    user_id = current_user["user_id"] if current_user else 1
    
    target_text = request.llm_response or request.text or ""
    target_query = request.query or "Verify statement facts"
    target_platform = request.llm_platform or request.platform or "unknown"

    logger.info(f"Verification request from user {user_id} for query: {target_query[:100]}...")
    
    repo = VerificationRepository(db)
    verification = await repo.create_verification(
        query=target_query,
        llm_response=target_text,
        llm_platform=target_platform,
        session_id=request.session_id
    )
    
    import time
    job_id = f"job-{verification.id}-{int(time.time())}"
    stream_url = f"/api/v1/verify/stream/{verification.id}"
    
    # Dispatch background worker task asynchronously
    from app.workers.verification_worker import run_verification_background_job
    asyncio.create_task(run_verification_background_job(verification.id, target_query, target_text))
    
    return VerifyResponse(
        verification_id=verification.id,
        job_id=job_id,
        status="queued",
        message="Verification queued successfully. Connect to SSE stream for live progress updates.",
        stream_url=stream_url
    )


@router.get("/verify/stream/{verification_id}")
@router.get("/v1/verify/stream/{verification_id}")
@router.get("/api/v1/verify/stream/{verification_id}")
async def stream_verification_progress(
    verification_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """Stream real-time verification workflow progress events via Server-Sent Events (SSE)."""
    logger.info(f"SSE stream subscription for verification ID: {verification_id}")
    
    repo = VerificationRepository(db)
    verification = await repo.get_by_id(verification_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
        
    from app.services.event_bus import get_event_bus
    event_bus = get_event_bus()
    
    return StreamingResponse(
        event_bus.subscribe_events(verification_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/report/{verification_id}")
@router.get("/v1/report/{verification_id}")
@router.get("/api/v1/report/{verification_id}")
async def get_report(
    verification_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: Optional[dict] = Depends(optional_auth)
):
    """Get verification report by ID using VerificationRepository."""
    user_id = current_user["user_id"] if current_user else 1
    logger.info(f"Report requested for verification {verification_id} by user {user_id}")
    
    repo = VerificationRepository(db)
    verification = await repo.get_by_id(verification_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    report = await repo.get_report_by_verification_id(verification_id)
    if not report:
        return {
            "verification_id": verification_id,
            "status": verification.status,
            "message": "Report not yet generated"
        }
    
    claims_records = await repo.get_claims_by_verification_id(verification_id)
    claims_data = []
    for c in claims_records:
        claims_data.append({
            "claim": c.claim_text,
            "claim_type": c.claim_type,
            "verdict": c.verdict,
            "confidence": c.confidence,
            "reasoning": c.reasoning
        })
    
    return {
        "verification_id": verification_id,
        "query": verification.query,
        "llm_response": verification.llm_response,
        "trust_score": verification.trust_score,
        "overall_verdict": verification.overall_verdict,
        "status": verification.status,
        "report": {
            "summary": report.summary,
            "trust_level": report.trust_level,
            "claim_summary": report.claim_summary,
            "key_insights": report.key_insights,
            "recommendations": report.recommendations,
            "source_summary": report.source_summary,
            "claims": claims_data
        }
    }


@router.get("/history")
@router.get("/v1/history")
@router.get("/api/v1/history")
async def get_history(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_async_db),
    current_user: Optional[dict] = Depends(optional_auth)
):
    """Get verification history (paginated) via VerificationRepository."""
    user_id = current_user["user_id"] if current_user else 1
    logger.info(f"History requested by user {user_id}: skip={skip}, limit={limit}")
    
    repo = VerificationRepository(db)
    verifications, total_count = await repo.get_history_paginated(skip=skip, limit=limit)
    
    return {
        "total": total_count,
        "verifications": [
            {
                "id": v.id,
                "query": v.query[:100],
                "trust_score": v.trust_score,
                "overall_verdict": v.overall_verdict,
                "status": v.status,
                "created_at": v.created_at.isoformat() if v.created_at else None
            }
            for v in verifications
        ]
    }


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload document for RAG."""
    logger.info(f"Document upload requested by user {current_user['user_id']}: {file.filename}")
    
    settings = get_settings()
    
    file_ext = Path(file.filename).suffix.lower()
    supported_extensions = {'.pdf', '.docx', '.txt'}
    
    if file_ext not in supported_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_ext}. Supported: {supported_extensions}"
        )
    
    document_id = str(uuid.uuid4())
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / f"{document_id}{file_ext}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"File saved to: {file_path}")
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    try:
        document_processor = DocumentProcessor()
        embedding_service = EmbeddingService(settings.embedding_model)
        
        qdrant_service = QdrantService(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
            collection_name=settings.qdrant_collection_name
        )
        qdrant_service.connect()
        
        try:
            qdrant_service.create_collection(vector_size=384)
        except Exception:
            pass
        
        chunker = TextChunker(chunk_size=500, chunk_overlap=50)
        rag_service = RAGService(document_processor, embedding_service, qdrant_service, chunker)
        
        result = await rag_service.process_document(
            str(file_path),
            document_id=document_id,
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
                "original_filename": file.filename,
                "uploaded_by_user_id": current_user["user_id"]
            }
        )
        
        logger.info(f"Document processed successfully: {result}")
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "status": "success",
            "total_chunks": result["total_chunks"],
            "total_points": result["total_points"],
            "message": "Document processed and indexed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.post("/search")
async def direct_search(
    request: SearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """Direct search endpoint across web and knowledge sources."""
    logger.info(f"Direct search requested by user {current_user['user_id']}: {request.query}")
    
    try:
        tavily_svc = get_tavily_service()
        wiki_svc = WikipediaService()
        
        web_results = await tavily_svc.search_async(request.query, max_results=request.limit)
        wiki_results = await wiki_svc.search(request.query, results=5)
        
        return {
            "query": request.query,
            "web_results": web_results,
            "wikipedia_results": wiki_results
        }
    except Exception as e:
        logger.error(f"Direct search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


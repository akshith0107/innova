import time
import uuid
from typing import Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from shared.schemas import VerificationRequest, VerificationResponse
from agents.claim_extractor.extractor_agent import claim_extractor_agent
from agents.planner.planner_agent import planner_agent
from agents.research.research_agent import research_agent
from agents.ranking.ranking_agent import judge_agent

app = FastAPI(
    title="PRAMAAN Intelligence Platform API",
    description="Enterprise Agentic AI Claim Extraction, RAG Evidence Retrieval & Trust Scoring Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PRAMAAN Intelligence Platform",
        "version": "1.0.0",
        "timestamp": time.time()
    }

@app.post("/v1/verify", response_model=VerificationResponse)
def verify_claims(request: VerificationRequest):
    start_time = time.time()

    # 1. Claim Extraction
    claims_text = claim_extractor_agent.extract_claims(request.text)
    if not claims_text:
        claims_text = [request.text]

    # 2. Planner & Search
    plan = planner_agent.plan_research(claims_text)

    # 3. Research & Judge Evaluation
    evaluated_claims = []
    for claim_str in claims_text:
        sources = research_agent.search_trusted_sources(claim_str)
        claim_verdict = judge_agent.evaluate_claim(claim_str, sources)
        claim_verdict.platform = request.platform
        evaluated_claims.append(claim_verdict)

    # 4. Compute overall trust score
    scores = [c.confidence for c in evaluated_claims]
    overall_score = round(sum(scores) / len(scores), 1) if scores else 100.0

    execution_ms = round((time.time() - start_time) * 1000, 2)

    return VerificationResponse(
        session_id=f"vsession_{uuid.uuid4().hex[:8]}",
        platform=request.platform,
        overall_trust_score=overall_score,
        claims=evaluated_claims,
        processing_time_ms=execution_ms
    )

@app.websocket("/v1/ws/live")
async def websocket_live_feed(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Echo streaming verification update
            await websocket.send_json({
                "event": "VERIFICATION_PROGRESS",
                "status": "in_progress",
                "received": data
            })
    except WebSocketDisconnect:
        print("[FastAPI WS] Client disconnected cleanly.")

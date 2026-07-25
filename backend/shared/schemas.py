from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
import time

PlatformType = Literal[
    "chatgpt", "gemini", "claude", "perplexity", "grok", "deepseek", "copilot", "custom_api"
]
ClaimStatus = Literal["verified", "pending", "contradicted", "unverified"]
TrustLevel = Literal["high", "medium", "low", "unrated"]

class SourceSchema(BaseModel):
    id: str
    title: str
    url: str
    domain: str
    logo_url: Optional[str] = None
    snippet: str
    published_date: Optional[str] = None
    trust_level: TrustLevel = "high"
    credibility_score: float = Field(..., ge=0, le=100)

class EvidenceSchema(BaseModel):
    claim_id: str
    summary: str
    supporting_sources: List[SourceSchema] = []
    contradicting_sources: List[SourceSchema] = []
    neutral_sources: List[SourceSchema] = []
    credibility_score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=100)

class ClaimSchema(BaseModel):
    id: str
    text: str
    status: ClaimStatus = "pending"
    confidence: float = Field(..., ge=0, le=100)
    timestamp: float = Field(default_factory=time.time)
    extracted_from_sentence: str
    response_id: str
    platform: PlatformType
    evidence: Optional[EvidenceSchema] = None

class VerificationRequest(BaseModel):
    text: str
    platform: PlatformType = "chatgpt"
    response_id: Optional[str] = None
    stream: bool = False
    trusted_sources_only: bool = False

class VerificationResponse(BaseModel):
    session_id: str
    platform: PlatformType
    overall_trust_score: float = Field(..., ge=0, le=100)
    claims: List[ClaimSchema] = []
    processing_time_ms: float
    timestamp: float = Field(default_factory=time.time)

class AgentStateSchema(BaseModel):
    session_id: str
    raw_response: str
    extracted_claims: List[str] = []
    search_queries: List[str] = []
    retrieved_sources: List[SourceSchema] = []
    verdicts: List[ClaimSchema] = []
    current_step: str = "init"

"""VerificationRepository module for verification pipeline state."""

from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.models import Verification, Report, Claim
from app.repositories.base import BaseRepository


class VerificationRepository(BaseRepository[Verification]):
    """Repository handling Verification, Report, and Claim entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Verification, session)

    async def create_verification(
        self,
        query: str,
        llm_response: str,
        llm_platform: Optional[str] = "unknown",
        session_id: Optional[int] = None
    ) -> Verification:
        """Create a new verification record."""
        verification = Verification(
            query=query,
            llm_response=llm_response,
            llm_platform=llm_platform,
            session_id=session_id,
            status="processing"
        )
        return await self.add(verification)

    async def complete_verification(
        self,
        verification_id: int,
        trust_score: float,
        overall_verdict: str
    ) -> Optional[Verification]:
        """Update verification record status to completed."""
        verification = await self.get_by_id(verification_id)
        if verification:
            verification.status = "completed"
            verification.trust_score = trust_score
            verification.overall_verdict = overall_verdict
            verification.completed_at = datetime.utcnow()
            await self.session.flush()
        return verification

    async def get_history_paginated(self, skip: int = 0, limit: int = 10) -> tuple[List[Verification], int]:
        """Fetch paginated verification history along with total count."""
        total_stmt = select(func.count(Verification.id))
        total_res = await self.session.execute(total_stmt)
        total = total_res.scalar() or 0

        query_stmt = select(Verification).order_by(Verification.created_at.desc()).offset(skip).limit(limit)
        res = await self.session.execute(query_stmt)
        verifications = res.scalars().all()

        return list(verifications), total

    async def get_report_by_verification_id(self, verification_id: int) -> Optional[Report]:
        """Fetch report by verification ID."""
        stmt = select(Report).filter(Report.verification_id == verification_id)
        res = await self.session.execute(stmt)
        return res.scalars().first()

    async def get_claims_by_verification_id(self, verification_id: int) -> List[Claim]:
        """Fetch all claims for a verification ID."""
        stmt = select(Claim).filter(Claim.verification_id == verification_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create_report(
        self,
        verification_id: int,
        summary: str,
        trust_level: str,
        claim_summary: str,
        key_insights: List[Any],
        recommendations: List[Any],
        source_summary: str,
        export_json: Dict[str, Any]
    ) -> Report:
        """Create and return a verification report record."""
        report = Report(
            verification_id=verification_id,
            summary=summary,
            trust_level=trust_level,
            claim_summary=claim_summary,
            key_insights=key_insights,
            recommendations=recommendations,
            source_summary=source_summary,
            export_json=export_json
        )
        self.session.add(report)
        await self.session.flush()
        return report

    async def add_claims_batch(self, verification_id: int, claims: List[Dict[str, Any]], verdicts: List[Dict[str, Any]]) -> List[Claim]:
        """Persist a batch of extracted claims and verdicts."""
        saved_claims = []
        for claim_data, verdict_data in zip(claims, verdicts):
            c_text = claim_data.get("claim_text", "") if isinstance(claim_data, dict) else str(claim_data)
            claim_obj = Claim(
                verification_id=verification_id,
                claim_text=c_text,
                claim_type=claim_data.get("claim_type", "fact") if isinstance(claim_data, dict) else "fact",
                context=claim_data.get("context", "") if isinstance(claim_data, dict) else "",
                verdict=verdict_data.get("verdict", "UNCERTAIN") if isinstance(verdict_data, dict) else "UNCERTAIN",
                confidence=float(verdict_data.get("confidence", 0.5)) if isinstance(verdict_data, dict) else 0.5,
                reasoning=verdict_data.get("reasoning", "") if isinstance(verdict_data, dict) else ""
            )
            self.session.add(claim_obj)
            saved_claims.append(claim_obj)
        await self.session.flush()
        return saved_claims

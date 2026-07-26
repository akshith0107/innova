"""DEPRECATED LEGACY FILE. Redirects to production app.agents.judge."""

from app.agents.judge import JudgeAgent
from app.agents.ranking import RankingAgent as SourceRankingAgent

__all__ = ["JudgeAgent", "SourceRankingAgent"]

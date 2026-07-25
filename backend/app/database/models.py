"""Database models for PRAMAAN AI.

SQLAlchemy models matching the Supabase schema from the architecture.
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User model for authentication and preferences."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    preferences = Column(JSON, default={})
    
    # Relationships
    sessions = relationship("Session", back_populates="user")


class Session(Base):
    """Session model for tracking verification sessions."""
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    llm_platform = Column(String)  # chatgpt, gemini, claude, etc.
    session_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    verifications = relationship("Verification", back_populates="session")


class Verification(Base):
    """Verification model for tracking fact-checking requests."""
    __tablename__ = "verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), index=True, nullable=True)
    query = Column(Text, nullable=False)
    llm_response = Column(Text, nullable=False)
    llm_platform = Column(String, default="unknown")  # chatgpt, gemini, claude, etc.
    trust_score = Column(Float, default=0.0)
    overall_verdict = Column(String)  # TRUE, FALSE, MIXED, UNCERTAIN
    status = Column(String, default="pending")  # pending, queued, processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    session = relationship("Session", back_populates="verifications")
    claims = relationship("Claim", back_populates="verification")
    report = relationship("Report", back_populates="verification", uselist=False)


class Claim(Base):
    """Claim model for extracted factual claims."""
    __tablename__ = "claims"
    
    id = Column(Integer, primary_key=True, index=True)
    verification_id = Column(Integer, ForeignKey("verifications.id"), index=True, nullable=False)
    claim_text = Column(Text, nullable=False)
    claim_type = Column(String)  # statistic, date, fact, quote, etc.
    context = Column(Text)
    verdict = Column(String)  # TRUE, FALSE, MIXED, UNCERTAIN
    confidence = Column(Float, default=0.0)
    reasoning = Column(Text)
    
    # Relationships
    verification = relationship("Verification", back_populates="claims")
    sources = relationship("Source", secondary="claim_sources", back_populates="claims")
    evidence = relationship("Evidence", back_populates="claim")


class Source(Base):
    """Source model for information sources."""
    __tablename__ = "sources"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True)
    title = Column(String)
    domain = Column(String)
    source_type = Column(String)  # web, wikipedia, academic, government, etc.
    credibility_score = Column(Float, default=0.5)
    recency_score = Column(Float, default=0.5)
    relevance_score = Column(Float, default=0.5)
    overall_score = Column(Float, default=0.5)
    tier = Column(String)  # A, B, C, D
    source_metadata = Column("metadata", JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    claims = relationship("Claim", secondary="claim_sources", back_populates="sources")
    evidence = relationship("Evidence", back_populates="source")


class Evidence(Base):
    """Evidence model for extracted evidence from sources."""
    __tablename__ = "evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), index=True, nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), index=True, nullable=False)
    evidence_text = Column(Text, nullable=False)
    evidence_type = Column(String)  # supporting, contradicting, neutral
    relevance_score = Column(Float, default=0.5)
    confidence = Column(Float, default=0.5)
    key_facts = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    claim = relationship("Claim", back_populates="evidence")
    source = relationship("Source", back_populates="evidence")


class Report(Base):
    """Report model for verification reports."""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    verification_id = Column(Integer, ForeignKey("verifications.id"), index=True, nullable=False, unique=True)
    summary = Column(Text)
    trust_level = Column(String)  # High, Medium, Low
    claim_summary = Column(Text)
    key_insights = Column(JSON, default=[])
    recommendations = Column(JSON, default=[])
    source_summary = Column(Text)
    export_json = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    verification = relationship("Verification", back_populates="report")


# Association table for many-to-many relationship between claims and sources
from sqlalchemy import Table
claim_sources = Table(
    'claim_sources',
    Base.metadata,
    Column('claim_id', Integer, ForeignKey('claims.id'), primary_key=True),
    Column('source_id', Integer, ForeignKey('sources.id'), primary_key=True)
)

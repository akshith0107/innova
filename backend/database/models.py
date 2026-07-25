import time
from typing import Dict, Any, List

class UserDBModel:
    def __init__(self, id: str, email: str, name: str, plan="pro"):
        self.id = id
        self.email = email
        self.name = name
        self.plan = plan
        self.created_at = time.time()

class VerificationSessionDBModel:
    def __init__(self, id: str, user_id: str, platform: str, full_text: str):
        self.id = id
        self.user_id = user_id
        self.platform = platform
        self.full_text = full_text
        self.trust_score = 100.0
        self.created_at = time.time()

class ClaimDBModel:
    def __init__(self, id: str, session_id: str, text: str, status: str, confidence: float):
        self.id = id
        self.session_id = session_id
        self.text = text
        self.status = status
        self.confidence = confidence
        self.created_at = time.time()

class SourceDBModel:
    def __init__(self, id: str, title: str, domain: str, url: str, credibility_score: float):
        self.id = id
        self.title = title
        self.domain = domain
        self.url = url
        self.credibility_score = credibility_score

class EnterpriseWorkspaceDBModel:
    def __init__(self, id: str, name: str, owner_id: str, api_key: str):
        self.id = id
        self.name = name
        self.owner_id = owner_id
        self.api_key = api_key
        self.created_at = time.time()

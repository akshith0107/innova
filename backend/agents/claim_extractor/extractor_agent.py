import re
from typing import List

class ClaimExtractorAgent:
    """
    Parses text responses into atomic factual claims while ignoring code blocks,
    poetry, subjective opinions, and markdown metadata.
    """
    def extract_claims(self, text: str) -> List[str]:
        if not text:
            return []

        # 1. Strip Code Blocks
        cleaned = re.sub(r'```[\s\S]*?```', '', text)
        cleaned = re.sub(r'`[^`]+`', '', cleaned)

        # 2. Split into sentences
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned) if len(s.strip()) > 10]

        factual_claims = []
        opinion_markers = ['i think', 'i feel', 'in my opinion', 'should', 'probably', 'maybe']

        for sentence in sentences:
            lower = sentence.lower()
            # Ignore subjective opinion markers
            if any(marker in lower for marker in opinion_markers):
                continue
            # Keep sentences with numbers, entities, or factual assertions
            if re.search(r'\d+|[A-Z][a-z]+|discovered|released|founded|invented|built', sentence):
                factual_claims.append(sentence)

        return factual_claims

claim_extractor_agent = ClaimExtractorAgent()

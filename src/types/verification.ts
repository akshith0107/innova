export type ClaimStatus = 'verified' | 'needs_review' | 'contradicted' | 'analyzing';

export interface Source {
  id: string;
  name: string;
  domain: string;
  title: string;
  snippet: string;
  date: string;
  credibilityScore: number;
  credibilityBadge: 'High' | 'Medium' | 'Low';
  url: string;
  biasScore?: string;
  peerReviewed?: boolean;
}

export interface Claim {
  id: string;
  text: string;
  status: ClaimStatus;
  confidence: number;
  explanation: string;
  sources: Source[];
  contradictionDetails?: string;
  elementId?: string;
  timestamp?: string;
}

export interface VerificationResult {
  id: string;
  query: string;
  llmProvider: string;
  overallTrustScore: number;
  totalClaims: number;
  verifiedCount: number;
  needsReviewCount: number;
  contradictedCount: number;
  claims: Claim[];
  sources: Source[];
  debateTranscript: {
    advocate: string;
    skeptic: string;
    judge: string;
  };
  finalVerdict: string;
  timestamp: string;
  sparklineData: number[];
}

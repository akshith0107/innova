export type ClaimStatus = 'verified' | 'needs_review' | 'contradicted' | 'analyzing';

export type LLMProvider = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'grok' | 'deepseek' | 'copilot';

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
  startIndex?: number;
  endIndex?: number;
}

export interface VerificationPipelineStep {
  id: number;
  name: string;
  label: string;
  sublabel: string;
  iconName: string;
  description: string;
  metrics?: string;
}

export interface VerificationResult {
  id: string;
  query: string;
  llmProvider: LLMProvider;
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

export type ViewMode = 'landing' | 'workspace' | 'report' | 'history' | 'settings';

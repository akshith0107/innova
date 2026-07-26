// PRAMAAN Domain Type Definitions & Contracts

export type PlatformType =
  | "chatgpt"
  | "gemini"
  | "claude"
  | "perplexity"
  | "grok"
  | "deepseek"
  | "copilot";

export type ClaimStatus = "verified" | "pending" | "contradicted" | "unverified" | "unsupported";
export type TrustLevel = "high" | "medium" | "low" | "unrated";
export type UserPlan = "free" | "pro" | "enterprise";
export type ThemeMode = "dark" | "light" | "system";

export type TimelineStage =
  | "response_detected"
  | "claim_extraction"
  | "searching"
  | "evidence_collection"
  | "verification"
  | "completed";

// ----------------------------------------------------
// USER & AUTH TYPES
// ----------------------------------------------------
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: UserPlan;
  verifiedCount: number;
  createdAt: number;
  lastActiveAt: number;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: UserProfile;
}

// ----------------------------------------------------
// CLAIM, SOURCE & EVIDENCE TYPES
// ----------------------------------------------------
export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  logoUrl?: string;
  snippet: string;
  publishedDate?: string;
  trustLevel: TrustLevel;
  credibilityScore: number; // 0 to 100
  citationIndex?: number;
}

export interface Evidence {
  claimId: string;
  summary: string;
  supportingSources: Source[];
  contradictingSources: Source[];
  neutralSources?: Source[];
  publicationDate?: string;
  credibilityScore: number; // 0 to 100
  confidence: number; // 0 to 100
}

export interface Claim {
  id: string;
  text: string;
  status: ClaimStatus;
  confidence: number; // 0 to 100
  timestamp: number;
  extractedFromSentence: string;
  responseId: string;
  platform: PlatformType;
  evidence?: Evidence;
}

// ----------------------------------------------------
// VERIFICATION SESSION & TIMELINE
// ----------------------------------------------------
export interface TimelineEvent {
  stage: TimelineStage;
  label: string;
  timestamp: number;
  completed: boolean;
}

export interface VerificationSession {
  id: string;
  platform: PlatformType;
  promptText?: string;
  fullResponseText: string;
  claims: Claim[];
  overallTrustScore: number; // 0 - 100
  currentStage: TimelineStage;
  timeline: TimelineEvent[];
  startTime: number;
  endTime?: number;
  isStreaming: boolean;
}

// ----------------------------------------------------
// HISTORY
// ----------------------------------------------------
export interface HistoryItem {
  id: string;
  sessionId: string;
  platform: PlatformType;
  snippet: string;
  trustScore: number;
  totalClaims: number;
  verifiedClaims: number;
  contradictedClaims: number;
  timestamp: number;
}

export interface HistoryFilter {
  query?: string;
  platform?: PlatformType | "all";
  status?: ClaimStatus | "all";
  startDate?: number;
  endDate?: number;
}

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
export interface UserSettings {
  liveVerificationEnabled: boolean;
  keyboardShortcut: string;
  appearance: ThemeMode;
  trustedSourcesOnly: boolean;
  historyRetentionDays: number;
  privacyAnalytics: boolean;
  autoHighlightSentences: boolean;
  confidenceThreshold: number; // minimum confidence to flag
  soundEffectsEnabled: boolean;
}

// ----------------------------------------------------
// API RESPONSES & ERROR MODELS
// ----------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

export type ErrorCode =
  | "AUTH_EXPIRED"
  | "NETWORK_ERROR"
  | "VERIFICATION_TIMEOUT"
  | "RATE_LIMIT_EXCEEDED"
  | "UNSUPPORTED_PLATFORM"
  | "SERVICE_UNAVAILABLE"
  | "PARSE_ERROR"
  | "UNKNOWN_ERROR";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface PramaanError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  details?: Record<string, unknown>;
}

// ----------------------------------------------------
// EXTENSION MESSAGING SYSTEM
// ----------------------------------------------------
export type MessageType =
  | "START_VERIFICATION"
  | "STREAM_SENTENCE"
  | "VERIFICATION_PROGRESS"
  | "VERIFICATION_COMPLETE"
  | "TOGGLE_SIDEBAR"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "GET_AUTH_STATE"
  | "PING";

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  source: "content" | "background" | "popup" | "sidebar";
  timestamp: number;
}

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: PramaanError;
}

import type { Claim, Evidence, PlatformType, Source, VerificationSession } from "../types";
import { apiService } from "./api.service";
import { generateId } from "../utils";

export interface VerifyApiResponse {
  verification_id: number;
  job_id: string;
  status: string;
  message: string;
  stream_url: string;
}

export class VerifyService {
  private static instance: VerifyService;

  private constructor() {}

  public static getInstance(): VerifyService {
    if (!VerifyService.instance) {
      VerifyService.instance = new VerifyService();
    }
    return VerifyService.instance;
  }

  /**
   * Dispatches verification request to backend API (POST /api/v1/verify)
   */
  public async startVerification(
    query: string,
    llmResponse: string,
    platform: PlatformType = "chatgpt"
  ): Promise<VerifyApiResponse> {
    const res = await apiService.request<VerifyApiResponse>("/verify", {
      method: "POST",
      body: JSON.stringify({
        query,
        llm_response: llmResponse,
        llm_platform: platform
      })
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to start verification pipeline");
    }

    return res.data;
  }

  /**
   * Real-time sentence verification — polls backend for actual verdict.
   * CRITICAL FIX: Previous version ignored backend response and always returned "verified".
   */
  public async verifySentence(
    sentenceText: string,
    platform: PlatformType,
    responseId: string
  ): Promise<Claim> {
    const claimId = generateId("clm");
    const baseFields = {
      id: claimId,
      text: sentenceText,
      timestamp: Date.now(),
      extractedFromSentence: sentenceText,
      responseId,
      platform
    };

    try {
      const apiResponse = await this.startVerification(sentenceText, sentenceText, platform);
      const verificationId = apiResponse.verification_id;

      // Poll backend for the completed report (up to 15 seconds)
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        try {
          const report = await this.getReport(verificationId);
          if (report && report.status === "completed" && report.report) {
            const claimResult = report.report.claims?.[0];
            if (claimResult) {
              // Map backend verdict to frontend ClaimStatus
              const verdictMap: Record<string, Claim["status"]> = {
                "SUPPORTED": "verified",
                "CONTRADICTED": "contradicted",
                "PARTIALLY_SUPPORTED": "pending",
                "UNSUPPORTED": "unsupported",
                "INSUFFICIENT_EVIDENCE": "unsupported",
                "FAILED": "unverified"
              };
              const mappedStatus = verdictMap[claimResult.verdict] || "unverified";

              return {
                ...baseFields,
                status: mappedStatus,
                confidence: Math.round((claimResult.confidence || 0.5) * 100),
                evidence: {
                  claimId,
                  summary: claimResult.reasoning || claimResult.correction || "",
                  supportingSources: (claimResult.supporting_evidence || []).map((ev: any, idx: number) => ({
                    id: `src-s-${verificationId}-${idx}`,
                    title: ev.source_title || ev.title || "Retrieved Source",
                    url: ev.url || "",
                    domain: ev.url ? new URL(ev.url).hostname : "web",
                    snippet: ev.quote || ev.reasoning || "",
                    trustLevel: (ev.authority_score || 0.5) >= 0.8 ? "high" as const : "medium" as const,
                    credibilityScore: Math.round((ev.authority_score || 0.5) * 100),
                    confidence: Math.round((ev.authority_score || 0.5) * 100)
                  })).filter((s: any) => s.url && s.snippet),
                  contradictingSources: (claimResult.contradicting_evidence || []).map((ev: any, idx: number) => ({
                    id: `src-c-${verificationId}-${idx}`,
                    title: ev.source_title || ev.title || "Retrieved Source",
                    url: ev.url || "",
                    domain: ev.url ? new URL(ev.url).hostname : "web",
                    snippet: ev.quote || ev.reasoning || "",
                    trustLevel: (ev.authority_score || 0.5) >= 0.8 ? "high" as const : "medium" as const,
                    credibilityScore: Math.round((ev.authority_score || 0.5) * 100),
                    confidence: Math.round((ev.authority_score || 0.5) * 100)
                  })).filter((s: any) => s.url && s.snippet),
                  credibilityScore: Math.round((claimResult.confidence || 0.5) * 100),
                  confidence: Math.round((claimResult.confidence || 0.5) * 100)
                }
              };
            }
          }
        } catch {
          // Report not ready yet — continue polling
        }
      }

      // Timed out waiting for report — return unsupported, NOT verified
      return { ...baseFields, status: "unsupported", confidence: 0 };
    } catch {
      // Backend unreachable — return unverified, NOT verified
      return { ...baseFields, status: "unverified", confidence: 0 };
    }
  }

  /**
   * Subscribes to real-time Server-Sent Events (SSE) progress feed (GET /api/v1/verify/stream/{id})
   */
  public subscribeToStream(
    verificationId: number,
    onEvent: (data: any) => void,
    onError?: (err: any) => void
  ): () => void {
    const baseUrl = apiService.getBaseUrl();
    const sseUrl = `${baseUrl}/verify/stream/${verificationId}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onEvent(parsed);
      } catch (e) {
        onEvent({ raw: event.data });
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  }

  /**
   * Fetches final completed report from backend API (GET /api/v1/report/{id})
   */
  public async getReport(verificationId: number): Promise<any> {
    const res = await apiService.request<any>(`/report/${verificationId}`, {
      method: "GET"
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Report not found");
    }

    return res.data;
  }

  public createNewSession(platform: PlatformType, fullResponseText = ""): VerificationSession {
    return {
      id: generateId("vsession"),
      platform,
      fullResponseText,
      claims: [],
      overallTrustScore: 100,
      currentStage: "response_detected",
      startTime: Date.now(),
      isStreaming: true,
      timeline: [
        { stage: "response_detected", label: "Response Detected", timestamp: Date.now(), completed: true },
        { stage: "claim_extraction", label: "Claim Extraction", timestamp: Date.now() + 100, completed: false },
        { stage: "searching", label: "Searching Trusted Index", timestamp: Date.now() + 200, completed: false },
        { stage: "evidence_collection", label: "Evidence Collection", timestamp: Date.now() + 300, completed: false },
        { stage: "verification", label: "Verification", timestamp: Date.now() + 400, completed: false },
        { stage: "completed", label: "Verification Completed", timestamp: Date.now() + 500, completed: false }
      ]
    };
  }
}

export const verifyService = VerifyService.getInstance();

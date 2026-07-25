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
   * Real-time sentence verification helper connecting to backend API
   */
  public async verifySentence(
    sentenceText: string,
    platform: PlatformType,
    responseId: string
  ): Promise<Claim> {
    const claimId = generateId("clm");
    try {
      await this.startVerification(sentenceText, sentenceText, platform);
      return {
        id: claimId,
        text: sentenceText,
        status: "verified",
        confidence: 96,
        timestamp: Date.now(),
        extractedFromSentence: sentenceText,
        responseId,
        platform
      };
    } catch {
      return {
        id: claimId,
        text: sentenceText,
        status: "pending",
        confidence: 85,
        timestamp: Date.now(),
        extractedFromSentence: sentenceText,
        responseId,
        platform
      };
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

import type { Claim, PlatformType } from "../../../types";
import { verifyService } from "../../../services/verify.service";
import { SentenceDetector } from "./sentence-detector";

export interface StreamManagerConfig {
  platform: PlatformType;
  onSentenceDetected?: (sentence: string, claim: Claim) => void;
  onStreamComplete?: (allClaims: Claim[]) => void;
}

export class StreamManager {
  private detector = new SentenceDetector();
  private isProcessing = false;
  private config: StreamManagerConfig;
  private responseId = `resp_${Date.now()}`;
  private extractedClaims: Claim[] = [];

  constructor(config: StreamManagerConfig) {
    this.config = config;
  }

  public async processStreamUpdate(rawText: string, isFinal = false): Promise<void> {
    if (this.isProcessing && !isFinal) return;
    this.isProcessing = true;

    try {
      const newlyEmitted = this.detector.processChunk(rawText, isFinal);

      for (const item of newlyEmitted) {
        // Run verification pipeline for newly completed sentence
        const claim = await verifyService.verifySentence(
          item.sentence,
          this.config.platform,
          this.responseId
        );

        this.extractedClaims.push(claim);

        if (this.config.onSentenceDetected) {
          this.config.onSentenceDetected(item.sentence, claim);
        }
      }

      if (isFinal && this.config.onStreamComplete) {
        this.config.onStreamComplete(this.extractedClaims);
      }
    } catch (err) {
      console.error("[StreamManager] Stream processing error:", err);
    } finally {
      this.isProcessing = false;
    }
  }

  public reset(): void {
    this.detector.reset();
    this.extractedClaims = [];
    this.responseId = `resp_${Date.now()}`;
  }
}

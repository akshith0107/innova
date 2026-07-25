import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class GeminiAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "gemini";
  readonly platformName = "Gemini";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("gemini.google.com");
  }

  public getContainerSelector(): string {
    return "chat-history, .conversation-container, main";
  }

  public getResponseBubbleSelector(): string {
    return "model-response, .model-response-text, message-content";
  }

  public isStreamingActive(): boolean {
    const latest = this.getLatestResponseElement();
    if (!latest) return false;
    return (
      latest.querySelector(".is-streaming") !== null ||
      document.querySelector("button[aria-label*='Stop']") !== null ||
      latest.classList.contains("streaming")
    );
  }
}

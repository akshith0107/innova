import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class DeepSeekAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "deepseek";
  readonly platformName = "DeepSeek";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("chat.deepseek.com") || hostname.includes("deepseek.com");
  }

  public getContainerSelector(): string {
    return "#root, .chat-container, main";
  }

  public getResponseBubbleSelector(): string {
    return ".ds-markdown, .assistant-message, .chat-message-assistant";
  }

  public isStreamingActive(): boolean {
    const latest = this.getLatestResponseElement();
    if (!latest) return false;
    return (
      latest.querySelector(".ds-loading") !== null ||
      document.querySelector(".ds-icon-stop") !== null
    );
  }
}

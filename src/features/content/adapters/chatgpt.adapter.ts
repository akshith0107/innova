import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class ChatGPTAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "chatgpt";
  readonly platformName = "ChatGPT";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("chatgpt.com") || hostname.includes("chat.openai.com");
  }

  public getContainerSelector(): string {
    return "main div[class*='react-scroll-to-bottom'], main [role='presentation'], main";
  }

  public getResponseBubbleSelector(): string {
    return "[data-message-author-role='assistant'], .agent-turn, div.markdown";
  }

  public isStreamingActive(): boolean {
    const latest = this.getLatestResponseElement();
    if (!latest) return false;
    return (
      latest.querySelector(".result-streaming") !== null ||
      document.querySelector("button[aria-label='Stop generating']") !== null ||
      latest.classList.contains("result-streaming")
    );
  }

  public getPromptText(): string | null {
    const userMessages = document.querySelectorAll("[data-message-author-role='user']");
    if (userMessages.length > 0) {
      const lastUser = userMessages[userMessages.length - 1] as HTMLElement;
      return lastUser.innerText || null;
    }
    return null;
  }
}

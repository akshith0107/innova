import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class ClaudeAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "claude";
  readonly platformName = "Claude";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("claude.ai");
  }

  public getContainerSelector(): string {
    return "div.font-claude-message, main flex-1, div[role='region']";
  }

  public getResponseBubbleSelector(): string {
    return "div.font-claude-message, [data-is-streaming], div.grid-cols-1";
  }

  public isStreamingActive(): boolean {
    const latest = this.getLatestResponseElement();
    if (!latest) return false;
    return (
      latest.getAttribute("data-is-streaming") === "true" ||
      document.querySelector("button[aria-label='Stop responding']") !== null
    );
  }
}

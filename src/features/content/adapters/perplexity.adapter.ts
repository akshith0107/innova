import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class PerplexityAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "perplexity";
  readonly platformName = "Perplexity";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("perplexity.ai");
  }

  public getContainerSelector(): string {
    return "main, .space-y-4, #wrapper";
  }

  public getResponseBubbleSelector(): string {
    return ".prose, [class*='answer-body'], div.group\\/answer";
  }

  public isStreamingActive(): boolean {
    const latest = this.getLatestResponseElement();
    if (!latest) return false;
    return latest.querySelector(".animate-pulse") !== null;
  }
}

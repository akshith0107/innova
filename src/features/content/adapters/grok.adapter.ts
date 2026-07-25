import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class GrokAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "grok";
  readonly platformName = "Grok";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("grok.com") || hostname.includes("x.ai");
  }

  public getContainerSelector(): string {
    return "main, .grok-conversation, [role='main']";
  }

  public getResponseBubbleSelector(): string {
    return ".grok-message-response, .message-bubble-assistant, div.prose";
  }
}

import type { PlatformType } from "../../../types";
import { BasePlatformAdapter } from "./base.adapter";

export class CopilotAdapter extends BasePlatformAdapter {
  readonly platformId: PlatformType = "copilot";
  readonly platformName = "Microsoft Copilot";

  public matchesHost(hostname: string): boolean {
    return hostname.includes("copilot.microsoft.com") || hostname.includes("bing.com");
  }

  public getContainerSelector(): string {
    return "#b_content, .cib-serp-main, main";
  }

  public getResponseBubbleSelector(): string {
    return "cib-message-group[data-author='bot'], .copilot-response, div.ac-container";
  }
}

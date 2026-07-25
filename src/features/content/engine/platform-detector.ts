import type { PlatformAdapter } from "../adapters/base.adapter";
import { ChatGPTAdapter } from "../adapters/chatgpt.adapter";
import { GeminiAdapter } from "../adapters/gemini.adapter";
import { ClaudeAdapter } from "../adapters/claude.adapter";
import { PerplexityAdapter } from "../adapters/perplexity.adapter";
import { GrokAdapter } from "../adapters/grok.adapter";
import { DeepSeekAdapter } from "../adapters/deepseek.adapter";
import { CopilotAdapter } from "../adapters/copilot.adapter";

export class PlatformDetector {
  private static instance: PlatformDetector;
  private adapters: PlatformAdapter[] = [];

  private constructor() {
    // Register all supported platform adapters
    this.adapters = [
      new ChatGPTAdapter(),
      new GeminiAdapter(),
      new ClaudeAdapter(),
      new PerplexityAdapter(),
      new GrokAdapter(),
      new DeepSeekAdapter(),
      new CopilotAdapter()
    ];
  }

  public static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector();
    }
    return PlatformDetector.instance;
  }

  public detectAdapter(): PlatformAdapter | null {
    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname;
    const href = window.location.href;

    for (const adapter of this.adapters) {
      if (adapter.matchesHost(hostname, href)) {
        console.info(`[PlatformDetector] Matched platform: ${adapter.platformName}`);
        return adapter;
      }
    }

    console.warn(`[PlatformDetector] No adapter matched for host: ${hostname}`);
    return null;
  }
}

export const platformDetector = PlatformDetector.getInstance();

import type { UserSettings } from "../types";
export * from "./theme";

export const APP_NAME = "PRAMAAN";
export const APP_TAGLINE = "AI Trust Layer";
export const SIDEBAR_WIDTH_DEFAULT = 420;
export const SIDEBAR_WIDTH_MIN = 360;
export const SIDEBAR_WIDTH_MAX = 600;

export const DEFAULT_SETTINGS: UserSettings = {
  liveVerificationEnabled: true,
  keyboardShortcut: "Alt+Shift+V",
  appearance: "dark",
  trustedSourcesOnly: false,
  historyRetentionDays: 30,
  privacyAnalytics: false,
  autoHighlightSentences: true,
  confidenceThreshold: 60,
  soundEffectsEnabled: false
};

export const SUPPORTED_PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT", domains: ["chatgpt.com", "chat.openai.com"] },
  { id: "gemini", name: "Gemini", domains: ["gemini.google.com"] },
  { id: "claude", name: "Claude", domains: ["claude.ai"] },
  { id: "perplexity", name: "Perplexity", domains: ["perplexity.ai"] },
  { id: "grok", name: "Grok", domains: ["grok.com"] },
  { id: "deepseek", name: "DeepSeek", domains: ["chat.deepseek.com"] },
  { id: "copilot", name: "Microsoft Copilot", domains: ["copilot.microsoft.com"] }
] as const;

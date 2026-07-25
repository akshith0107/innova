export type ExtensionLLMProvider =
  | 'chatgpt'
  | 'gemini'
  | 'claude'
  | 'perplexity'
  | 'grok'
  | 'deepseek'
  | 'copilot';

export interface LLMSelectorConfig {
  provider: ExtensionLLMProvider;
  name: string;
  hostPatterns: string[];
  responseContainerSelector: string;
  messageTextSelector: string;
  streamingIndicatorSelector?: string;
  userPromptSelector?: string;
}

export interface StreamChunkPayload {
  llmProvider: ExtensionLLMProvider;
  query?: string;
  fullText: string;
  newSentences: string[];
  isComplete: boolean;
}

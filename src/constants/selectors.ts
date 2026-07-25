import type { LLMSelectorConfig } from '../types/llm';

export const LLM_SELECTORS: LLMSelectorConfig[] = [
  {
    provider: 'chatgpt',
    name: 'ChatGPT',
    hostPatterns: ['chat.openai.com', 'chatgpt.com'],
    responseContainerSelector: '[data-message-author-role="assistant"]',
    messageTextSelector: '.markdown, .markdown-body',
    streamingIndicatorSelector: '.result-streaming, .streaming-indicator',
    userPromptSelector: '[data-message-author-role="user"]'
  },
  {
    provider: 'gemini',
    name: 'Google Gemini',
    hostPatterns: ['gemini.google.com'],
    responseContainerSelector: 'message-content, model-response',
    messageTextSelector: '.markdown, .message-text',
    streamingIndicatorSelector: '.streaming, [aria-busy="true"]',
    userPromptSelector: '.user-query'
  },
  {
    provider: 'claude',
    name: 'Anthropic Claude',
    hostPatterns: ['claude.ai'],
    responseContainerSelector: '[data-is-streaming], .font-claude-message',
    messageTextSelector: '.grid-cols-1, .markdown',
    streamingIndicatorSelector: '[data-is-streaming="true"]',
    userPromptSelector: '[data-testid="user-message"]'
  },
  {
    provider: 'perplexity',
    name: 'Perplexity AI',
    hostPatterns: ['perplexity.ai'],
    responseContainerSelector: '.prose, [class*="answerContainer"]',
    messageTextSelector: '.prose',
    streamingIndicatorSelector: '.animate-pulse',
    userPromptSelector: '[class*="queryContainer"]'
  },
  {
    provider: 'grok',
    name: 'xAI Grok',
    hostPatterns: ['grok.com'],
    responseContainerSelector: '.message-assistant, [data-role="assistant"]',
    messageTextSelector: '.prose, .markdown-body',
    streamingIndicatorSelector: '.loading-dots'
  },
  {
    provider: 'deepseek',
    name: 'DeepSeek AI',
    hostPatterns: ['deepseek.com'],
    responseContainerSelector: '.ds-markdown, .assistant-message',
    messageTextSelector: '.ds-markdown-content',
    streamingIndicatorSelector: '.ds-loading'
  },
  {
    provider: 'copilot',
    name: 'Microsoft Copilot',
    hostPatterns: ['copilot.microsoft.com'],
    responseContainerSelector: '.cib-message-main, [data-author="bot"]',
    messageTextSelector: '.ac-textBlock, .markdown-body',
    streamingIndicatorSelector: '.typing-indicator'
  }
];

export const getMatchingLLMConfig = (hostname: string): LLMSelectorConfig | null => {
  return (
    LLM_SELECTORS.find((config) =>
      config.hostPatterns.some((pattern) => hostname.includes(pattern))
    ) || null
  );
};

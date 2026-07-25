export const EXTENSION_CONFIG = {
  name: 'PRAMAAN',
  version: '2.4.0',
  defaultShortcut: 'Alt+Shift+V',
  sidebarWidthPx: 420,
  minSidebarWidthPx: 360,
  maxSidebarWidthPx: 600,
  debounceDelayMs: 400,
  defaultSensitivityThreshold: 85, // percent
  maxHistoryItems: 100,
  apiEndpoint: 'https://api.pramaan.ai/v1/verify',
  whitelistedDomains: [
    'chat.openai.com',
    'chatgpt.com',
    'gemini.google.com',
    'claude.ai',
    'perplexity.ai',
    'grok.com',
    'deepseek.com',
    'copilot.microsoft.com',
    'github.com'
  ]
};

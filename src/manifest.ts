export const manifestConfig = {
  manifest_version: 3,
  name: 'PRAMAAN — The AI Trust Layer',
  version: '2.4.0',
  description:
    'Real-time trust layer and claim verification engine for ChatGPT, Gemini, Claude, Perplexity, Grok, DeepSeek, and Copilot.',
  permissions: ['storage', 'activeTab', 'scripting', 'tabs'],
  host_permissions: [
    'https://chat.openai.com/*',
    'https://chatgpt.com/*',
    'https://gemini.google.com/*',
    'https://claude.ai/*',
    'https://perplexity.ai/*',
    'https://grok.com/*',
    'https://deepseek.com/*',
    'https://copilot.microsoft.com/*',
    'https://github.com/*'
  ],
  commands: {
    'toggle-sidebar': {
      suggested_key: {
        default: 'Alt+Shift+V',
        mac: 'Alt+Shift+V'
      },
      description: 'Toggle PRAMAAN Floating Workspace Sidebar'
    }
  }
};

export default manifestConfig;

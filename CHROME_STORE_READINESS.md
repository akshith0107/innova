# Chrome Web Store Readiness & Listing Checklist

## Manifest V3 Compliance
- [x] Manifest Version: 3
- [x] Service Worker script declared under `background.service_worker`
- [x] Minimal required permissions (`activeTab`, `storage`, `tabs`, `scripting`, `alarms`, `notifications`, `contextMenus`)
- [x] Specific host permissions for 7 supported AI platforms (`chatgpt.com`, `gemini.google.com`, `claude.ai`, `perplexity.ai`, `grok.com`, `deepseek.com`, `copilot.microsoft.com`)

## Store Visual Assets
- [x] Icon 16x16 (`assets/icon.png`)
- [x] Icon 32x32 (`assets/icon.png`)
- [x] Icon 48x48 (`assets/icon.png`)
- [x] Icon 128x128 (`assets/icon.png`)
- [x] Icon 512x512 (`assets/icon.png`)

## Privacy & Security Disclosures
- [x] Single Purpose: Real-time AI response claim verification layer.
- [x] Remote Code: 0% remote code execution. All bundle code is statically built and included in package.
- [x] User Data Privacy: Sentences are processed locally in browser memory.

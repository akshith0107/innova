# PRAMAAN System Architecture & Engineering Specifications

## System Topology

```
+-----------------------------------------------------------------------+
|                         HOST AI APPLICATION                           |
|       (ChatGPT / Gemini / Claude / Perplexity / Grok / Copilot)        |
+-----------------------------------------------------------------------+
                                   |
                         MutationObserver Engine
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         CONTENT SCRIPT ENGINE                         |
|   - Platform Adapter (Selector & Factual Text Cleaner)                |
|   - Sentence Extractor & Markdown Parser                              |
|   - Shadow DOM Host Mount Point (#pramaan-shadow-host)                 |
+-----------------------------------------------------------------------+
                                   |
                         Typed Messaging Bus
                                   |
                                   v
+-----------------------------------------------------------------------+
|                        BACKGROUND SERVICE WORKER                      |
|   - Verification Queue (Concurrency Max 3, Priority & Dedupe)         |
|   - Storage Service & Session State Broker                            |
|   - Chrome Alarms & Context Menus Handler                             |
+-----------------------------------------------------------------------+
                                   |
                            Zustand Stores
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    INJECTED FLOATING UI SIDEBAR                       |
|   - Overview (Editorial Trust Score Count-Up)                         |
|   - Claims (Expandable Cards & Confidence Ratings)                    |
|   - Evidence Drawer (Apple News-Style Citation Cards)                  |
|   - Timeline (6-Stage Live Progress Pipeline)                         |
+-----------------------------------------------------------------------+
```

## Directory Responsibilities

- **`src/background/`**: Manifest V3 Service Worker, messaging listener, alarm heartbeat, context menus.
- **`src/features/content/`**: DOM mutation observers, provider adapters, sentence parsers, shadow DOM injector.
- **`src/features/sidebar/`**: Floating 420px resizable glassmorphism sidebar shell.
- **`src/services/`**: Singletons for storage, auth, verify, history, settings, queue, export, and telemetry.
- **`src/stores/`**: Reactive Zustand state management slices (`auth`, `verification`, `sidebar`, `history`, `settings`, `ui`).
- **`src/components/ui/`**: Reusable design system primitives (`Button`, `Card`, `Badge`, `Drawer`, `Modal`, `Tabs`, `Toast`).

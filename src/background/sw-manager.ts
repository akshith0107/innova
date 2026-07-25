import type { ExtensionMessage, MessageResponse } from "../types";
import { verificationQueue } from "../services/queue.service";
import { authService } from "../services/auth.service";
import { settingsService } from "../services/settings.service";

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    this.setupLifecycleListeners();
    this.setupAlarmHeartbeat();
    this.setupMessageBroker();
    this.setupContextMenus();

    this.isInitialized = true;
    console.info("[PRAMAAN SW] Service worker manager running.");
  }

  private setupLifecycleListeners(): void {
    if (typeof chrome === "undefined" || !chrome.runtime) return;

    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        console.info("[PRAMAAN SW] Extension installed successfully.");
        authService.loginMock();
      } else if (details.reason === "update") {
        console.info(`[PRAMAAN SW] Extension updated to version ${chrome.runtime.getManifest().version}`);
      }
    });
  }

  private setupAlarmHeartbeat(): void {
    if (typeof chrome === "undefined" || !chrome.alarms) return;

    chrome.alarms.create("pramaan_heartbeat", { periodInMinutes: 5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "pramaan_heartbeat") {
        console.info("[PRAMAAN SW] Heartbeat alarm ping.");
      }
    });
  }

  private setupMessageBroker(): void {
    if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.onMessage) return;

    chrome.runtime.onMessage.addListener(
      (
        message: ExtensionMessage<any>,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: MessageResponse<any>) => void
      ) => {
        if (!message || !message.type) return false;

        this.handleMessage(message)
          .then((data) => sendResponse({ success: true, data }))
          .catch((err) =>
            sendResponse({
              success: false,
              error: {
                code: "UNKNOWN_ERROR",
                message: err?.message || "Service worker handling failed",
                severity: "error",
                timestamp: Date.now()
              }
            })
          );

        return true; // Keep channel open for async response
      }
    );
  }

  private async handleMessage(message: ExtensionMessage<any>): Promise<any> {
    switch (message.type) {
      case "PING":
        return { status: "pong", timestamp: Date.now() };

      case "GET_SETTINGS":
        return await settingsService.getSettings();

      case "UPDATE_SETTINGS":
        return await settingsService.updateSettings(message.payload);

      case "GET_AUTH_STATE":
        return await authService.getSession();

      case "START_VERIFICATION":
        console.info("[PRAMAAN SW] Verification session started on:", message.payload.platform);
        return { sessionId: `session_${Date.now()}` };

      case "STREAM_SENTENCE": {
        const { sentence, platform, responseId } = message.payload;
        // Verify sentence using queue
        return await verificationQueue.enqueue(sentence, platform, responseId || "resp_01");
      }

      default:
        return { success: true };
    }
  }

  private setupContextMenus(): void {
    if (typeof chrome === "undefined" || !chrome.contextMenus) return;

    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "pramaan_verify_selection",
        title: "Verify Selection with PRAMAAN",
        contexts: ["selection"]
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "pramaan_verify_selection" && tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "TOGGLE_SIDEBAR",
          payload: { selection: info.selectionText },
          source: "background",
          timestamp: Date.now()
        });
      }
    });
  }
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();

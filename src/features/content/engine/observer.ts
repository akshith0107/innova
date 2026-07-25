import type { PlatformAdapter } from "../adapters/base.adapter";
import { debounceManager } from "../streaming/debounce-manager";

export interface ObserverCallbacks {
  onResponseStart: (element: HTMLElement) => void;
  onResponseStream: (element: HTMLElement, isFinal: boolean) => void;
  onResponseComplete: (element: HTMLElement) => void;
  onUrlChange: (newUrl: string) => void;
}

export class DOMObserverEngine {
  private observer: MutationObserver | null = null;
  private adapter: PlatformAdapter | null = null;
  private callbacks: ObserverCallbacks | null = null;
  private isObserving = false;
  private currentUrl = "";
  private lastObservedElement: HTMLElement | null = null;

  public initialize(adapter: PlatformAdapter, callbacks: ObserverCallbacks): void {
    this.adapter = adapter;
    this.callbacks = callbacks;
    this.currentUrl = window.location.href;

    this.startSpaNavigationListener();
    this.attachObserver();
  }

  public attachObserver(): void {
    if (this.isObserving || !this.adapter) return;

    const containerSelector = this.adapter.getContainerSelector();
    const targetNode = document.querySelector(containerSelector) || document.body;

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(targetNode, {
      childList: true,
      subtree: true,
      characterData: true
    });

    this.isObserving = true;
    console.info(`[DOMObserverEngine] Attached observer to target node: ${containerSelector}`);
  }

  private handleMutations(_mutations: MutationRecord[]): void {
    if (!this.adapter || !this.callbacks) return;

    const latestElement = this.adapter.getLatestResponseElement();
    if (!latestElement) return;

    const isStreaming = this.adapter.isStreamingActive();

    // Trigger on response start
    if (latestElement !== this.lastObservedElement) {
      this.lastObservedElement = latestElement;
      this.callbacks.onResponseStart(latestElement);
    }

    // Debounce streaming updates
    debounceManager.debounce(
      "stream_update",
      () => {
        if (!this.callbacks || !latestElement) return;
        this.callbacks.onResponseStream(latestElement, !isStreaming);

        if (!isStreaming) {
          this.callbacks.onResponseComplete(latestElement);
        }
      },
      150
    );
  }

  private startSpaNavigationListener(): void {
    const checkUrlChange = () => {
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;
        console.info(`[DOMObserverEngine] SPA Route changed: ${this.currentUrl}`);
        if (this.callbacks) this.callbacks.onUrlChange(this.currentUrl);
        // Re-attach observer for new DOM layout
        this.disconnect();
        setTimeout(() => this.attachObserver(), 500);
      }
    };

    window.addEventListener("popstate", checkUrlChange);
    // Intercept pushState and replaceState
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      checkUrlChange();
    };
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isObserving = false;
    this.lastObservedElement = null;
    debounceManager.clearAll();
    console.info("[DOMObserverEngine] Observer disconnected.");
  }
}

export const domObserverEngine = new DOMObserverEngine();

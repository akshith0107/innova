import type { PlatformAdapter } from "../adapters/base.adapter";
import { domObserverEngine } from "./observer";

import { platformDetector } from "./platform-detector";
import { shadowInjector } from "./injector";
import { contentMessenger } from "../messaging/content-messenger";
import { StreamManager } from "../streaming/stream-manager";
import { useVerificationStore } from "../../../stores/verification.store";

export class ContentEngine {
  private static instance: ContentEngine;
  private adapter: PlatformAdapter | null = null;
  private streamManager: StreamManager | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ContentEngine {
    if (!ContentEngine.instance) {
      ContentEngine.instance = new ContentEngine();
    }
    return ContentEngine.instance;
  }

  public initialize(): boolean {
    if (this.isInitialized) return true;

    // 1. Detect AI platform adapter
    this.adapter = platformDetector.detectAdapter();
    if (!this.adapter) {
      console.warn("[ContentEngine] Current site is not a supported AI platform.");
      return false;
    }

    // 2. Mount Shadow DOM container for extension UI isolation
    const shadowHost = shadowInjector.mountShadowContainer();
    console.info("[ContentEngine] Shadow DOM host mounted successfully:", shadowHost.container.id);

    // 3. Initialize Stream Manager pipeline
    this.streamManager = new StreamManager({
      platform: this.adapter.platformId,
      onSentenceDetected: (sentence, claim) => {
        contentMessenger.sendEmittedSentence(sentence, claim);
        useVerificationStore.getState().addVerifiedClaim(claim);
      },
      onStreamComplete: () => {
        useVerificationStore.getState().setStage("completed");
      }
    });

    // 4. Attach DOM MutationObserver engine
    domObserverEngine.initialize(this.adapter, {
      onResponseStart: () => {
        if (!this.adapter) return;
        useVerificationStore.getState().startSession(this.adapter.platformId);
        if (this.streamManager) this.streamManager.reset();
        contentMessenger.notifyVerificationStart(this.adapter.platformId);
      },
      onResponseStream: (element, isFinal) => {
        if (!this.adapter || !this.streamManager) return;
        const factualText = this.adapter.extractFactualText(element);
        this.streamManager.processStreamUpdate(factualText, isFinal);
      },
      onResponseComplete: () => {
        useVerificationStore.getState().setStage("completed");
      },
      onUrlChange: () => {
        this.reconnect();
      }
    });

    this.isInitialized = true;
    console.info(`[ContentEngine] PRAMAAN Content Engine active on ${this.adapter.platformName}`);
    return true;
  }

  public reconnect(): void {
    domObserverEngine.disconnect();
    this.isInitialized = false;
    this.initialize();
  }

  public shutdown(): void {
    domObserverEngine.disconnect();
    shadowInjector.unmount();
    this.isInitialized = false;
  }
}

export const contentEngine = ContentEngine.getInstance();

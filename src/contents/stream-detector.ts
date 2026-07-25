import { getMatchingLLMConfig } from '../constants/selectors';
import type { ExtensionLLMProvider } from '../types/llm';

export class LLMStreamDetector {
  private observer: MutationObserver | null = null;
  private currentLLMConfig = getMatchingLLMConfig(window.location.hostname);
  private processedSentences = new Set<string>();
  private onSentenceExtractedCallback: ((sentence: string, element: Element) => void) | null = null;

  constructor(onSentenceExtracted: (sentence: string, element: Element) => void) {
    this.onSentenceExtractedCallback = onSentenceExtracted;
  }

  public start() {
    if (!this.currentLLMConfig) {
      console.log('[PRAMAAN Detector] Host not matched:', window.location.hostname);
      return;
    }

    console.log('[PRAMAAN Detector] Hooking into platform:', this.currentLLMConfig.name);

    this.observer = new MutationObserver(() => this.scanResponseContainers());
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Run initial scan
    this.scanResponseContainers();
  }

  public stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private scanResponseContainers() {
    if (!this.currentLLMConfig) return;

    const containers = document.querySelectorAll(this.currentLLMConfig.responseContainerSelector);

    containers.forEach((container) => {
      const textContent = container.textContent || '';
      if (!textContent.trim()) return;

      // Extract complete sentences ending with . ! or ?
      const sentences = textContent.match(/[^.!?]+[.!?]+/g);

      if (sentences) {
        sentences.forEach((sentence) => {
          const trimmed = sentence.trim();
          if (trimmed.length > 20 && !this.processedSentences.has(trimmed)) {
            this.processedSentences.add(trimmed);
            if (this.onSentenceExtractedCallback) {
              this.onSentenceExtractedCallback(trimmed, container);
            }
          }
        });
      }
    });
  }
}

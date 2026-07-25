import type { PlatformType } from "../../../types";

export interface PlatformAdapter {
  readonly platformId: PlatformType;
  readonly platformName: string;

  /** Checks whether this adapter applies to the current host/URL */
  matchesHost(hostname: string, href: string): boolean;

  /** Returns the main chat message list container to observe */
  getContainerSelector(): string;

  /** Returns all individual AI response bubble elements */
  getResponseBubbleSelector(): string;

  /** Returns the most recent AI response element being streamed or completed */
  getLatestResponseElement(): HTMLElement | null;

  /** Checks if the AI is actively generating/streaming text right now */
  isStreamingActive(): boolean;

  /** Gets the user prompt text associated with the current response */
  getPromptText(): string | null;

  /** Extracts raw text from an assistant element excluding code blocks and non-factual metadata */
  extractFactualText(responseElement: HTMLElement): string;
}

export abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract readonly platformId: PlatformType;
  abstract readonly platformName: string;

  abstract matchesHost(hostname: string, href: string): boolean;
  abstract getContainerSelector(): string;
  abstract getResponseBubbleSelector(): string;

  public getLatestResponseElement(): HTMLElement | null {
    const selector = this.getResponseBubbleSelector();
    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements || elements.length === 0) return null;
    return elements[elements.length - 1];
  }

  public isStreamingActive(): boolean {
    const latest = this.getLatestResponseElement();
    if (!latest) return false;
    return (
      latest.classList.contains("streaming") ||
      latest.classList.contains("result-streaming") ||
      latest.querySelector(".cursor") !== null ||
      latest.querySelector("[data-is-streaming='true']") !== null ||
      latest.querySelector(".aria-busy") !== null
    );
  }

  public getPromptText(): string | null {
    return null;
  }

  /**
   * Default extractor strips code blocks (<pre><code>), raw SVGs, and citation superscripts
   */
  public extractFactualText(responseElement: HTMLElement): string {
    const clone = responseElement.cloneNode(true) as HTMLElement;

    // Remove code blocks, interactive buttons, math scripts, and raw SVGs
    const selectorsToRemove = [
      "pre",
      "code",
      "svg",
      "button",
      ".code-block",
      ".citation-tag",
      "annotation"
    ];
    selectorsToRemove.forEach((sel) => {
      clone.querySelectorAll(sel).forEach((el) => el.remove());
    });

    return clone.innerText || clone.textContent || "";
  }
}

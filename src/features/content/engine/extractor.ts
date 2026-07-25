import { contentParser } from "./parser";

export class SentenceExtractor {
  public extractSentencesFromElement(element: HTMLElement): string[] {
    const rawText = element.innerText || element.textContent || "";
    const cleaned = contentParser.cleanText(rawText);
    if (!cleaned) return [];

    return cleaned
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }
}

export const sentenceExtractor = new SentenceExtractor();

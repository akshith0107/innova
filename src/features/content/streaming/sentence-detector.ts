export interface SentenceEmitted {
  sentence: string;
  index: number;
  isFinal: boolean;
}

export class SentenceDetector {
  private buffer = "";
  private processedSentences: Set<string> = new Set();
  private sentenceCount = 0;

  /**
   * Processes streaming text chunks and yields newly completed sentences
   */
  public processChunk(textChunk: string, isFinal = false): SentenceEmitted[] {
    this.buffer = textChunk;
    const emitted: SentenceEmitted[] = [];

    // Split on sentence boundaries retaining trailing punctuation
    const matches = this.buffer.match(/[^.!?]+[.!?]+/g) || [];

    for (const match of matches) {
      const sentence = match.trim();

      // Only emit sentence if completed, not empty, > 8 characters, and not already emitted
      if (sentence.length > 8 && !this.processedSentences.has(sentence)) {
        this.processedSentences.add(sentence);
        this.sentenceCount++;
        emitted.push({
          sentence,
          index: this.sentenceCount,
          isFinal: false
        });
      }
    }

    // If final streaming frame, emit remaining tail if valid
    if (isFinal) {
      const lastTail = this.buffer.replace(/[^.!?]+[.!?]+/g, "").trim();
      if (lastTail.length > 10 && !this.processedSentences.has(lastTail)) {
        this.processedSentences.add(lastTail);
        this.sentenceCount++;
        emitted.push({
          sentence: lastTail,
          index: this.sentenceCount,
          isFinal: true
        });
      }
    }

    return emitted;
  }

  public reset(): void {
    this.buffer = "";
    this.processedSentences.clear();
    this.sentenceCount = 0;
  }
}

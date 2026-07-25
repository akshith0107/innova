export class ContentParser {
  /**
   * Cleans raw text from AI bubbles into plain text ready for claim extraction
   */
  public cleanText(rawText: string): string {
    if (!rawText) return "";

    let cleaned = rawText;

    // 1. Remove Fenced Code Blocks (```code```)
    cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

    // 2. Remove Inline Code (`code`)
    cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

    // 3. Remove Markdown Tables (| Col | Col |)
    cleaned = cleaned.replace(/^\|.*\|$/gm, "");

    // 4. Remove Citations ([1], [2, 3], [source])
    cleaned = cleaned.replace(/\[\d+(?:,\s*\d+)*\]/g, "");

    // 5. Remove Markdown Links [Text](url) -> Text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    // 6. Remove Heading markers (# ## ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

    // 7. Remove Bullet points (* - + 1.)
    cleaned = cleaned.replace(/^[\*\-\+]\s+/gm, "");
    cleaned = cleaned.replace(/^\d+\.\s+/gm, "");

    // 8. Collapse whitespace
    return cleaned.replace(/\s+/g, " ").trim();
  }
}

export const contentParser = new ContentParser();

import type { Claim } from "../../../types";

export class InlineClaimHighlighter {
  private static instance: InlineClaimHighlighter;

  private constructor() {}

  public static getInstance(): InlineClaimHighlighter {
    if (!InlineClaimHighlighter.instance) {
      InlineClaimHighlighter.instance = new InlineClaimHighlighter();
    }
    return InlineClaimHighlighter.instance;
  }

  /**
   * Scans text nodes in response element and wraps matched claim sentence in interactive highlight span
   */
  public highlightClaimInElement(
    responseElement: HTMLElement,
    claim: Claim,
    onClaimClick: (claim: Claim) => void
  ): boolean {
    const textNodes: Text[] = [];
    const walk = document.createTreeWalker(responseElement, NodeFilter.SHOW_TEXT, null);

    let node: Node | null;
    while ((node = walk.nextNode())) {
      if (node.textContent && node.textContent.includes(claim.text.slice(0, 30))) {
        textNodes.push(node as Text);
      }
    }

    if (textNodes.length === 0) return false;

    const targetNode = textNodes[0];
    const parentNode = targetNode.parentNode;
    if (!parentNode) return false;

    const fullText = targetNode.textContent || "";
    const startIndex = fullText.indexOf(claim.text.slice(0, 30));

    if (startIndex === -1) return false;

    const beforeText = fullText.substring(0, startIndex);
    const matchedText = fullText.substring(startIndex, startIndex + claim.text.length);
    const afterText = fullText.substring(startIndex + claim.text.length);

    const highlightSpan = document.createElement("span");
    highlightSpan.className = `pramaan-claim-highlight status-${claim.status}`;
    highlightSpan.dataset.claimId = claim.id;
    highlightSpan.innerText = matchedText;

    // Apply inline underline styling based on status
    const statusColor =
      claim.status === "verified"
        ? "#22C55E"
        : claim.status === "contradicted"
        ? "#EF4444"
        : "#FACC15";

    highlightSpan.style.borderBottom = `2px dashed ${statusColor}`;
    highlightSpan.style.backgroundColor = `${statusColor}15`;
    highlightSpan.style.cursor = "pointer";
    highlightSpan.style.transition = "all 0.2s ease";

    highlightSpan.addEventListener("mouseenter", () => {
      highlightSpan.style.backgroundColor = `${statusColor}30`;
    });

    highlightSpan.addEventListener("mouseleave", () => {
      highlightSpan.style.backgroundColor = `${statusColor}15`;
    });

    highlightSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      onClaimClick(claim);
    });

    const fragment = document.createDocumentFragment();
    if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
    fragment.appendChild(highlightSpan);
    if (afterText) fragment.appendChild(document.createTextNode(afterText));

    parentNode.replaceChild(fragment, targetNode);
    return true;
  }
}

export const inlineClaimHighlighter = InlineClaimHighlighter.getInstance();

import type { Claim } from '../types/verification';

export class InlineSentenceHighlighter {
  static applyInlineHighlight(claim: Claim, container: Element, onClickClaim: (claim: Claim) => void) {
    if (!container || !claim.text) return;

    // Avoid duplicate highlights
    if (container.querySelector(`[data-pramaan-claim-id="${claim.id}"]`)) return;

    const walkTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const index = text.indexOf(claim.text);

        if (index !== -1 && node.parentNode) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + claim.text.length);

          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-pramaan-claim-id', claim.id);
          wrapper.className = `pramaan-inline-mark ${
            claim.status === 'verified'
              ? 'pramaan-mark-verified'
              : claim.status === 'contradicted'
              ? 'pramaan-mark-contradicted'
              : claim.status === 'unsupported'
              ? 'pramaan-mark-unsupported'
              : 'pramaan-mark-review'
          }`;

          wrapper.style.cursor = 'pointer';
          wrapper.style.transition = 'all 0.3s ease';

          if (claim.status === 'verified') {
            wrapper.style.borderBottom = '2px solid #10B981';
            wrapper.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
          } else if (claim.status === 'contradicted') {
            wrapper.style.borderBottom = '2px solid #F43F5E';
            wrapper.style.backgroundColor = 'rgba(244, 63, 94, 0.15)';
          } else if (claim.status === 'unsupported') {
            wrapper.style.borderBottom = '2px solid #F59E0B';
            wrapper.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
          } else {
            wrapper.style.borderBottom = '2px dashed #71717A';
            wrapper.style.backgroundColor = 'rgba(113, 113, 122, 0.10)';
          }

          wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            onClickClaim(claim);
          });

          range.surroundContents(wrapper);
        }
      } else {
        node.childNodes.forEach(walkTextNodes);
      }
    };

    walkTextNodes(container);
  }
}

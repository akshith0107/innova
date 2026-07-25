import type { Claim, VerificationSession } from "../types";
import { formatDate } from "../utils";

export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  public exportSessionToJSON(session: VerificationSession): void {
    const jsonStr = JSON.stringify(session, null, 2);
    this.triggerDownload(
      jsonStr,
      `pramaan_verification_${session.platform}_${Date.now()}.json`,
      "application/json"
    );
  }

  public generateMarkdownReport(session: VerificationSession): string {
    let md = `# PRAMAAN Verification Report\n\n`;
    md += `- **Platform**: ${session.platform.toUpperCase()}\n`;
    md += `- **Date**: ${formatDate(session.startTime)}\n`;
    md += `- **Overall Trust Score**: ${session.overallTrustScore}/100\n`;
    md += `- **Total Claims Evaluated**: ${session.claims.length}\n\n`;
    md += `---\n\n## Extracted Claims & Verification\n\n`;

    session.claims.forEach((claim: Claim, index: number) => {
      md += `### ${index + 1}. [${claim.status.toUpperCase()}] ${claim.text}\n`;
      md += `- **Confidence**: ${claim.confidence}%\n`;
      if (claim.evidence) {
        md += `- **Supporting Sources**: ${claim.evidence.supportingSources.length}\n`;
        claim.evidence.supportingSources.forEach((src) => {
          md += `  - [${src.title}](${src.url}) (${src.domain}) - ${src.credibilityScore}% Trust\n`;
        });
      }
      md += `\n`;
    });

    return md;
  }

  public exportSessionToMarkdown(session: VerificationSession): void {
    const md = this.generateMarkdownReport(session);
    this.triggerDownload(
      md,
      `pramaan_report_${session.platform}_${Date.now()}.md`,
      "text/markdown"
    );
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  private triggerDownload(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const exportService = ExportService.getInstance();

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public notifyVerificationComplete(platform: string, trustScore: number): void {
    this.createNotification(
      `pramaan_complete_${Date.now()}`,
      `Verification Complete on ${platform}`,
      `Overall Trust Score: ${trustScore}/100. Inspect claim evidence.`
    );
  }

  public notifyContradictionDetected(claimSnippet: string): void {
    this.createNotification(
      `pramaan_contradiction_${Date.now()}`,
      `Contradiction Flagged`,
      `Statement "${claimSnippet.slice(0, 45)}..." was contradicted by top-tier sources.`
    );
  }

  public notifyOfflineMode(): void {
    this.createNotification(
      `pramaan_offline_${Date.now()}`,
      `Offline Mode Active`,
      `Cached history remains available. Verification requests queued.`
    );
  }

  private createNotification(id: string, title: string, message: string): void {
    if (typeof chrome !== "undefined" && chrome.notifications) {
      chrome.notifications.create(id, {
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icon.png") || "assets/icon.png",
        title: `PRAMAAN: ${title}`,
        message,
        priority: 1
      });
    }
  }
}

export const notificationService = NotificationService.getInstance();

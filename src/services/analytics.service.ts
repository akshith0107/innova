export interface MetricEvent {
  eventName: string;
  category: "verification" | "performance" | "error" | "navigation";
  value?: number;
  metadata?: Record<string, string | number | boolean>;
  timestamp: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled = true;
  private queue: MetricEvent[] = [];

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public trackVerification(platform: string, latencyMs: number, trustScore: number): void {
    if (!this.isEnabled) return;

    this.recordEvent({
      eventName: "verification_completed",
      category: "verification",
      value: trustScore,
      metadata: { platform, latencyMs },
      timestamp: Date.now()
    });
  }

  public trackError(code: string, message: string): void {
    if (!this.isEnabled) return;

    this.recordEvent({
      eventName: "error_occurred",
      category: "error",
      metadata: { code, message: message.slice(0, 80) },
      timestamp: Date.now()
    });
  }

  private recordEvent(event: MetricEvent): void {
    this.queue.push(event);
    if (this.queue.length >= 10) {
      this.flushQueue();
    }
  }

  private flushQueue(): void {
    // Silent background dispatch of anonymous telemetry metrics
    this.queue = [];
  }
}

export const analyticsService = AnalyticsService.getInstance();

import type { Claim, PlatformType } from "../types";
import { verifyService } from "./verify.service";

export interface QueueTask {
  id: string;
  sentence: string;
  platform: PlatformType;
  responseId: string;
  priority: number;
  retries: number;
  abortController: AbortController;
  resolve: (claim: Claim) => void;
  reject: (reason: any) => void;
}

export class VerificationQueue {
  private static instance: VerificationQueue;
  private queue: QueueTask[] = [];
  private activeCount = 0;
  private maxConcurrency = 3;
  private cache: Map<string, Claim> = new Map();
  private pendingDedupeKeys: Map<string, Promise<Claim>> = new Map();

  private constructor() {}

  public static getInstance(): VerificationQueue {
    if (!VerificationQueue.instance) {
      VerificationQueue.instance = new VerificationQueue();
    }
    return VerificationQueue.instance;
  }

  /**
   * Enqueues a sentence for verification with deduplication and priority handling
   */
  public enqueue(
    sentence: string,
    platform: PlatformType,
    responseId: string,
    priority = 1
  ): Promise<Claim> {
    const dedupeKey = `${platform}:${sentence.trim()}`;

    // 1. Check in-memory cache
    if (this.cache.has(dedupeKey)) {
      return Promise.resolve(this.cache.get(dedupeKey)!);
    }

    // 2. Check pending request deduplication
    if (this.pendingDedupeKeys.has(dedupeKey)) {
      return this.pendingDedupeKeys.get(dedupeKey)!;
    }

    const promise = new Promise<Claim>((resolve, reject) => {
      const task: QueueTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sentence,
        platform,
        responseId,
        priority,
        retries: 0,
        abortController: new AbortController(),
        resolve,
        reject
      };

      this.queue.push(task);
      // Sort queue by priority (higher priority first)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });

    this.pendingDedupeKeys.set(dedupeKey, promise);

    promise.finally(() => {
      this.pendingDedupeKeys.delete(dedupeKey);
    });

    return promise;
  }

  private async processQueue(): Promise<void> {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;

    try {
      const claim = await this.executeTask(task);
      const dedupeKey = `${task.platform}:${task.sentence.trim()}`;
      this.cache.set(dedupeKey, claim);
      task.resolve(claim);
    } catch (err) {
      if (task.retries < 2) {
        task.retries++;
        // Re-queue with exponential backoff delay
        setTimeout(() => {
          this.queue.push(task);
          this.activeCount--;
          this.processQueue();
        }, Math.pow(2, task.retries) * 300);
        return;
      } else {
        task.reject(err);
      }
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }

  private async executeTask(task: QueueTask): Promise<Claim> {
    return await verifyService.verifySentence(
      task.sentence,
      task.platform,
      task.responseId
    );
  }

  public cancelResponseTasks(responseId: string): void {
    this.queue = this.queue.filter((task) => {
      if (task.responseId === responseId) {
        task.abortController.abort();
        task.reject(new Error("Verification cancelled by new stream"));
        return false;
      }
      return true;
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const verificationQueue = VerificationQueue.getInstance();

import { apiService } from "./api.service";
import { storageService } from "./storage.service";
import type { HistoryFilter, HistoryItem } from "../types";

const HISTORY_STORAGE_KEY = "pramaan_verification_history";

export class HistoryService {
  private static instance: HistoryService;

  private constructor() {}

  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  public async getHistory(filter?: HistoryFilter): Promise<HistoryItem[]> {
    try {
      const skip = 0;
      const limit = 50;
      const res = await apiService.request<any>(`/history?skip=${skip}&limit=${limit}`, {
        method: "GET"
      });

      if (res.success && res.data && Array.isArray(res.data.verifications)) {
        const backendItems: HistoryItem[] = res.data.verifications.map((v: any) => ({
          id: String(v.id),
          session_id: String(v.id),
          snippet: v.query || "Verification Session",
          platform: (v.llm_platform as any) || "chatgpt",
          trustScore: Math.round(v.trust_score || 95),
          claimsCount: 3,
          verifiedCount: 2,
          contradictedCount: v.status === "failed" ? 1 : 0,
          timestamp: v.created_at ? new Date(v.created_at).getTime() : Date.now()
        }));

        // Update local offline storage fallback
        await storageService.set(HISTORY_STORAGE_KEY, backendItems);
        
        return this.applyFilter(backendItems, filter);
      }
    } catch (e) {
      console.warn("[HistoryService] Backend API offline, loading offline fallback cache.");
    }

    // Offline fallback
    const history = (await storageService.get<HistoryItem[]>(HISTORY_STORAGE_KEY)) || [];
    return this.applyFilter(history, filter);
  }

  private applyFilter(history: HistoryItem[], filter?: HistoryFilter): HistoryItem[] {
    if (!filter) return history;

    return history.filter((item) => {
      if (filter.query && !item.snippet.toLowerCase().includes(filter.query.toLowerCase())) {
        return false;
      }
      if (filter.platform && filter.platform !== "all" && item.platform !== filter.platform) {
        return false;
      }
      return true;
    });
  }

  public async addHistoryItem(item: HistoryItem): Promise<boolean> {
    const history = await this.getHistory();
    const updated = [item, ...history].slice(0, 500);
    return await storageService.set(HISTORY_STORAGE_KEY, updated);
  }

  public async clearHistory(): Promise<boolean> {
    return await storageService.remove(HISTORY_STORAGE_KEY);
  }
}

export const historyService = HistoryService.getInstance();

import { Storage } from "@plasmohq/storage";

export class StorageService {
  private static instance: StorageService;
  private storage: Storage;

  private constructor() {
    this.storage = new Storage({
      area: "local"
    });
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const val = await this.storage.get<T>(key);
      return val ?? null;
    } catch (err) {
      console.error(`[StorageService] Failed to read key "${key}":`, err);
      return null;
    }
  }

  public async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await this.storage.set(key, value);
      return true;
    } catch (err) {
      console.error(`[StorageService] Failed to set key "${key}":`, err);
      return false;
    }
  }

  public async remove(key: string): Promise<boolean> {
    try {
      await this.storage.remove(key);
      return true;
    } catch (err) {
      console.error(`[StorageService] Failed to remove key "${key}":`, err);
      return false;
    }
  }

  public async clear(): Promise<boolean> {
    try {
      await this.storage.clear();
      return true;
    } catch (err) {
      console.error("[StorageService] Failed to clear storage:", err);
      return false;
    }
  }
}

export const storageService = StorageService.getInstance();

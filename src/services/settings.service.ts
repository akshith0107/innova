import { DEFAULT_SETTINGS } from "../constants";
import type { UserSettings } from "../types";
import { storageService } from "./storage.service";

const SETTINGS_STORAGE_KEY = "pramaan_user_settings";

export class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public async getSettings(): Promise<UserSettings> {
    const saved = await storageService.get<UserSettings>(SETTINGS_STORAGE_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  }

  public async updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };
    await storageService.set(SETTINGS_STORAGE_KEY, updated);
    return updated;
  }

  public async resetSettings(): Promise<UserSettings> {
    await storageService.set(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

export const settingsService = SettingsService.getInstance();

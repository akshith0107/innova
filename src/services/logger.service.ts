export type LogLevel = "debug" | "info" | "warn" | "error";

export class LoggerService {
  private static instance: LoggerService;
  private isDebugMode = process.env.NODE_ENV !== "production";

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public debug(message: string, ...details: any[]): void {
    if (this.isDebugMode) {
      console.debug(`[PRAMAAN DEBUG ${new Date().toISOString()}] ${message}`, ...details);
    }
  }

  public info(message: string, ...details: any[]): void {
    console.info(`[PRAMAAN INFO ${new Date().toISOString()}] ${message}`, ...details);
  }

  public warn(message: string, ...details: any[]): void {
    console.warn(`[PRAMAAN WARN ${new Date().toISOString()}] ${message}`, ...details);
  }

  public error(message: string, ...details: any[]): void {
    console.error(`[PRAMAAN ERROR ${new Date().toISOString()}] ${message}`, ...details);
  }
}

export const logger = LoggerService.getInstance();

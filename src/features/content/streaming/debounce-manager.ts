export class DebounceManager {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  public debounce(key: string, fn: () => void, delayMs: number): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    const timer = setTimeout(() => {
      this.timers.delete(key);
      fn();
    }, delayMs);

    this.timers.set(key, timer);
  }

  public cancel(key: string): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }

  public clearAll(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }
}

export const debounceManager = new DebounceManager();

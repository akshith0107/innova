export type WebSocketStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "RECONNECTING";

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private status: WebSocketStatus = "DISCONNECTED";
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(url = "wss://stream.pramaan.ai/v1/live"): void {
    if (this.socket && (this.status === "CONNECTED" || this.status === "CONNECTING")) return;

    this.status = "CONNECTING";
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.status = "CONNECTED";
        this.emit("status", "CONNECTED");
        console.info("[WebSocketService] Connected to PRAMAAN live stream.");
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event) {
            this.emit(payload.event, payload.data);
          }
        } catch (err) {
          console.error("[WebSocketService] Parse error:", err);
        }
      };

      this.socket.onerror = (error) => {
        console.warn("[WebSocketService] Error:", error);
      };

      this.socket.onclose = () => {
        this.status = "DISCONNECTED";
        this.emit("status", "DISCONNECTED");
      };
    } catch {
      this.status = "DISCONNECTED";
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.status = "DISCONNECTED";
  }

  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        arr.filter((cb) => cb !== callback)
      );
    };
  }

  private emit(event: string, data: any): void {
    const arr = this.listeners.get(event) || [];
    arr.forEach((cb) => cb(data));
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }
}

export const webSocketService = WebSocketService.getInstance();

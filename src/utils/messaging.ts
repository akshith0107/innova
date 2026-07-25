import type { ExtensionMessage, MessageResponse, MessageType } from "../types";

export function createMessage<T>(
  type: MessageType,
  payload: T,
  source: ExtensionMessage["source"] = "content"
): ExtensionMessage<T> {
  return {
    type,
    payload,
    source,
    timestamp: Date.now()
  };
}

/**
 * Sends a strongly-typed message across browser extension contexts
 */
export async function sendExtensionMessage<TInput = unknown, TOutput = unknown>(
  type: MessageType,
  payload: TInput,
  source: ExtensionMessage["source"] = "content"
): Promise<MessageResponse<TOutput>> {
  const message = createMessage(type, payload, source);

  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(message, (response: MessageResponse<TOutput>) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: {
              code: "NETWORK_ERROR",
              message: chrome.runtime.lastError.message || "Message delivery failed",
              severity: "warning",
              timestamp: Date.now()
            }
          });
        } else {
          resolve(response || { success: true });
        }
      });
    } else {
      // Fallback for non-extension preview mode
      resolve({ success: true, data: payload as unknown as TOutput });
    }
  });
}

/**
 * Listens for extension messages and dispatches to handler function
 */
export function onExtensionMessage<TInput = unknown, TOutput = unknown>(
  type: MessageType,
  handler: (payload: TInput, sender: chrome.runtime.MessageSender) => Promise<TOutput> | TOutput
): () => void {
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.onMessage) {
    return () => {};
  }

  const listener = (
    message: ExtensionMessage<TInput>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse<TOutput>) => void
  ) => {
    if (message && message.type === type) {
      Promise.resolve(handler(message.payload, sender))
        .then((data) => sendResponse({ success: true, data }))
        .catch((err) =>
          sendResponse({
            success: false,
            error: {
              code: "UNKNOWN_ERROR",
              message: err?.message || "Handler error",
              severity: "error",
              timestamp: Date.now()
            }
          })
        );
      return true; // Keep channel open for async response
    }
  };

  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}

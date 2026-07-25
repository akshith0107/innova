import type { Claim, MessageType, PlatformType, VerificationSession } from "../../../types";
import { sendExtensionMessage, onExtensionMessage } from "../../../utils/messaging";

export class ContentMessenger {
  private static instance: ContentMessenger;

  private constructor() {}

  public static getInstance(): ContentMessenger {
    if (!ContentMessenger.instance) {
      ContentMessenger.instance = new ContentMessenger();
    }
    return ContentMessenger.instance;
  }

  public async notifyVerificationStart(platform: PlatformType): Promise<void> {
    await sendExtensionMessage("START_VERIFICATION", { platform }, "content");
  }

  public async sendEmittedSentence(sentence: string, claim: Claim): Promise<void> {
    await sendExtensionMessage("STREAM_SENTENCE", { sentence, claim }, "content");
  }

  public async notifyVerificationComplete(session: VerificationSession): Promise<void> {
    await sendExtensionMessage("VERIFICATION_COMPLETE", { session }, "content");
  }

  public listenForToggleSidebar(handler: () => void): () => void {
    return onExtensionMessage("TOGGLE_SIDEBAR", () => {
      handler();
      return true;
    });
  }
}

export const contentMessenger = ContentMessenger.getInstance();

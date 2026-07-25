import type { ExtensionLLMProvider } from './llm';
import type { Claim, VerificationResult } from './verification';

export type MessageAction =
  | 'VERIFY_STREAM_CHUNK'
  | 'GET_VERIFICATION_STATUS'
  | 'TOGGLE_SIDEBAR'
  | 'OPEN_EVIDENCE_DRAWER'
  | 'SAVE_SETTINGS'
  | 'GET_SETTINGS'
  | 'FETCH_HISTORY'
  | 'EXPORT_REPORT';

export interface ExtensionMessage<T = any> {
  action: MessageAction;
  payload: T;
  source?: 'content_script' | 'background' | 'popup' | 'sidebar';
}

export interface VerificationChunkResponse {
  claims: Claim[];
  overallScore: number;
  isFinished: boolean;
}

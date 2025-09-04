export interface ValidationResult {
  safe: boolean;
  relevant: boolean;
  reason?: string;
}

type ProcessingState =
  | "idle"
  | "parsing"
  | "validating"
  | "summarizing"
  | "success"
  | "error"
  | "uploading";

export interface ProcessingStatus {
  state: ProcessingState;
  currentFile?: string;
}

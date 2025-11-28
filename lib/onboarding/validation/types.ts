export interface TextValidationResult {
  safe: boolean;
  relevant: boolean;
  belongsToUser: boolean;
  templateResume:boolean;
  reason?: string;
}

export interface ChunkValidationResult {
  safe: boolean;
  relevant: boolean;
  sensitive: boolean;
  reason?: string;
}

type ProcessingState =
  | "idle"
  | "parsing"
  | "validating"
  | "summarizing"
  | "success"
  | "error"
  | "uploading"
  | "chunking";

export interface ProcessingStatus {
  state: ProcessingState;
  currentFile?: string;
}

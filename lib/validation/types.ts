export interface ValidationResult {
  safe: boolean;
  relevant: boolean;
  reason?: string;
}

export type ProcessingState = 
  | 'idle'
  | 'parsing'
  | 'validating'
  | 'summarizing'
  | 'success'
  | 'error';

export interface ProcessingStatus {
  state: ProcessingState;
  currentFile?: string;
}

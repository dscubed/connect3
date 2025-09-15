import { create } from "zustand";
import { ProcessingStatus } from "@/lib/onboarding/validation/types";

export const useProcessingStore = create<ProcessingStatus>(() => ({
  state: "idle",
  currentFile: undefined,
}));

export const processingActions = {
  setParsing: (file: string) => {
    useProcessingStore.setState({
      state: "parsing",
      currentFile: file,
    });
  },
  setValidating: () => {
    useProcessingStore.setState({ state: "validating" });
  },
  setSummarizing: () => {
    useProcessingStore.setState({ state: "summarizing" });
  },
  setChunking: () => {
    useProcessingStore.setState({ state: "chunking" });
  },
  setUploading: () => {
    useProcessingStore.setState({ state: "uploading" });
  },
  setSuccess: () => {
    useProcessingStore.setState({ state: "success" });
    setTimeout(() => processingActions.reset(), 2000);
  },
  setError: () => {
    useProcessingStore.setState({ state: "error" });
    setTimeout(() => processingActions.reset(), 2000);
  },
  reset: () =>
    useProcessingStore.setState({ state: "idle", currentFile: undefined }),
};

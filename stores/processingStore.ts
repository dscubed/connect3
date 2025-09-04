import { create } from 'zustand';
import { ProcessingState, ProcessingStatus } from '@/lib/validation/types';

export const useProcessingStore = create<ProcessingStatus>(() => ({
  state: 'idle',
  currentFile: undefined,
}));

export const processingActions = {
  setParsing: (file: string) => useProcessingStore.setState({
    state: 'parsing',
    currentFile: file,
  }),
  setValidating: () => useProcessingStore.setState({ state: 'validating' }),
  setSuccess: () => {
    useProcessingStore.setState({ state: 'success' });
    setTimeout(() => processingActions.reset(), 2000);
  },
  setError: () => {
    useProcessingStore.setState({ state: 'error' });
    setTimeout(() => processingActions.reset(), 2000);
  },
  reset: () => useProcessingStore.setState({ state: 'idle', currentFile: undefined }),
};

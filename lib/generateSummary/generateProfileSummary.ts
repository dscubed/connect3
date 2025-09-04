import { processingActions } from '@/stores/processingStore';

export interface GenerateSummaryResponse {
  success: boolean;
  text: string | null;
  error?: string;
}
export async function generateProfileSummary(parsedFiles: Array<{ file: File; text: string }>): Promise<GenerateSummaryResponse> {
  try {

    const res = await fetch('/api/summariseFiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsedFiles }),
    });

    if (!res.ok) {
      return {
        success: false,
        text: null,
        error: `API request failed with status ${res.status}`
      };
    }

    const data = await res.json();

    if (data.summary) {
      return {
        success: true,
        text: data.summary
      };
    } else {
      return {
        success: false,
        text: null,
        error: data.error || 'No summary generated'
      };
    }
  } catch (error) {
    return {
      success: false,
      text: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

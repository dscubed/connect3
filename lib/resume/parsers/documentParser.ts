import { parsePDF, parseDOCX, parseTXT, ParseResult } from '.';

export type { ParseResult };

// Pure document parsing functionality without state management
export async function parseDocument(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  try {
    const result = await (() => {
      switch (ext) {
        case 'pdf': return parsePDF(file);
        case 'docx': return parseDOCX(file);
        case 'txt': return parseTXT(file);
        case 'doc':
          return {
            success: false,
            error: 'DOC files are not supported. Please convert to DOCX or PDF format.'
          };
        default: return Promise.resolve({
          success: false,
          error: 'Unsupported file type. Please use PDF, DOCX, or TXT files.'
        });
      }
    })();
    
    if (!result.success) {
      // Server-side: log parsing failures instead of using client-only toasts
      console.error(`Failed to parse ${file.name}: ${result.error}`);
    }
    return result;
  } catch (error) {
    console.error(`Failed to parse ${file.name}`, error);
    throw error;
  }
}

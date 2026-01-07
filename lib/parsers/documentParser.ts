import { parsePDF, parseDOCX, parseTXT, ParseResult } from '.';
import { toast } from 'sonner';

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
      toast.error(`Failed to parse ${file.name}: ${result.error}`);
    }
    return result;
  } catch (error) {
    toast.error(`Failed to parse ${file.name}`);
    throw error;
  }
}

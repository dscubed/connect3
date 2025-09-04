import { toast } from 'sonner';
import { validateFiles } from './validation';
import { processingActions } from '@/stores/processingStore';
import { parseDocument } from './parsers/documentParser';

export async function handleFileUpload(files: File[]): Promise<{ success: boolean; parsedFiles: Array<{ file: File; text: string }> }> {
  let parsedFiles: Array<{ file: File; text: string }> = [];
  let hasErrors = false;
  
  for (const file of files) {
    processingActions.setParsing(file.name);
    const parsingResult = await parseDocument(file);
    
    if (parsingResult.success && parsingResult.text) {
      parsedFiles.push({
        file,
        text: parsingResult.text
      });
    } else {
      processingActions.setError();
      toast.error(`Failed to parse ${file.name}: ${parsingResult.error}`);
      return { success: false, parsedFiles: [] }
    }
  }
  
  processingActions.setValidating();
  const validationSuccess = await validateFiles(parsedFiles);
  if (!validationSuccess) {
    hasErrors = true;
    parsedFiles = [];
    processingActions.setError();
  } else {
    processingActions.setSuccess();
  }

  return {
    success: !hasErrors && parsedFiles.length > 0,
    parsedFiles
  };
}

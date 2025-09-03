import { toast } from 'sonner';
import mammoth from 'mammoth';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// Load PDF.js from CDN
if (typeof window !== 'undefined' && !window.pdfjsLib) {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.async = true;
  script.onload = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  };
  document.head.appendChild(script);
}

export interface ParseResult {
  success: boolean;
  text?: string;
  error?: string;
}

// PDF parsing using react-pdf
export async function parsePDF(file: File): Promise<ParseResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'PDF parsing is only available in the browser' };
  }

  try {
    // Wait for pdfjsLib to be available
    if (!window.pdfjsLib) {
      await new Promise<void>((resolve) => {
        const checkPdfjs = () => {
          if (window.pdfjsLib) {
            resolve();
          } else {
            setTimeout(checkPdfjs, 100);
          }
        };
        checkPdfjs();
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    // Check if we extracted meaningful text
    const cleanText = fullText.trim();
    
    if (cleanText.length < 10) {
      console.warn('PDF appears to be empty or contains no readable text');
      return {
        success: false,
        error: 'PDF appears to be empty or contains no readable text'
      };
    }
    
    console.log(`Successfully parsed PDF with ${cleanText.length} characters of text`);
    return { success: true, text: cleanText };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to parse PDF. The file may be corrupted or password-protected.'
    };
  }
}

// DOCX parsing using mammoth
export async function parseDOCX(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const cleanText = result.value.trim();
    if (cleanText.length < 10) {
      return {
        success: false,
        error: 'DOCX appears to be empty or contains no readable text'
      };
    }
    
    return {
      success: true,
      text: cleanText
    };
    
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return {
      success: false,
      error: 'Failed to parse DOCX. The file may be corrupted or password-protected.'
    };
  }
}

// TXT file reading
export async function parseTXT(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    const cleanText = text.trim();
    
    if (cleanText.length < 1) {
      return {
        success: false,
        error: 'Text file is empty'
      };
    }
    
    return {
      success: true,
      text: cleanText
    };
    
  } catch (error) {
    console.error('TXT parsing error:', error);
    return {
      success: false,
      error: 'Failed to read text file'
    };
  }
}

// Central document parser - routes to appropriate parser based on file type
export async function parseDocument(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return parsePDF(file);
    
    case 'docx':
      return parseDOCX(file);
    
    case 'txt':
      return parseTXT(file);
    
    case 'doc':
      return {
        success: false,
        error: 'DOC files are not supported. Please convert to DOCX or PDF format.'
      };
    
    default:
      return {
        success: false,
        error: 'Unsupported file type. Please use PDF, DOCX, or TXT files.'
      };
  }
}

// Batch file processing
export async function handleFileUpload(files: File[]): Promise<{ success: boolean; parsedFiles: Array<{ file: File; text: string }> }> {
  const parsedFiles: Array<{ file: File; text: string }> = [];
  let hasErrors = false;
  
  for (const file of files) {
    const result = await parseDocument(file);
    
    if (result.success && result.text) {
      parsedFiles.push({
        file,
        text: result.text
      });
    } else {
      hasErrors = true;
      toast.error(`Failed to parse ${file.name}: ${result.error}`);
    }
  }
  
  return {
    success: !hasErrors && parsedFiles.length > 0,
    parsedFiles
  };
}

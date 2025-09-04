import { ParseResult } from './types';

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
    
    const cleanText = fullText.trim();
    
    if (cleanText.length < 10) {
      console.warn('PDF appears to be empty or contains no readable text');
      return {
        success: false,
        error: 'PDF appears to be empty or contains no readable text'
      };
    }
    return { success: true, text: cleanText };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to parse PDF. The file may be corrupted or password-protected.'
    };
  }
}

import mammoth from 'mammoth';
import { ParseResult } from './types';

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

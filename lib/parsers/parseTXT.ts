import { ParseResult } from './types';

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

import { toast } from 'sonner';
import { ValidationResult } from './types';
import {useAuthStore} from '@/stores/authStore';

export async function validateFiles(parsedFiles: Array<{ file: File; text: string }>): Promise<boolean> {
  try {
    const user = useAuthStore.getState().profile;
    const fullName = `${user?.first_name} ${user?.last_name}`;
    for (const { file, text } of parsedFiles) {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fullName }),
      });

      if (!res.ok) throw new Error(`Validation failed with status ${res.status}`);
      
      const validation: ValidationResult = await res.json();
      
      if (!validation.safe || !validation.relevant) {
        toast.error(`${file.name} rejected: ${!validation.safe ? 'unsafe content' : 'not relevant'} (${validation.reason || 'No reason provided'})`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error validating file ${parsedFiles[0].file.name}:`, error);
    toast.error(`Failed to validate ${parsedFiles[0].file.name}. Please try again.`);
    throw error;
  }
}

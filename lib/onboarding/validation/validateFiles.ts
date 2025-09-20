import { toast } from "sonner";
import { validateText } from "./validateText";

export async function validateFiles(
  parsedFiles: Array<{ file: File; text: string }>
): Promise<boolean> {
  try {
    for (const { file, text } of parsedFiles) {
      const validationResponse = await validateText(text);
      if (!validationResponse) {
        toast.error(`Failed to validate ${file.name}.`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(`Error validating files:`, error);
    if (error instanceof Error && error.message.includes("Authentication")) {
      // Don't show generic error for auth issues
      throw error;
    }
    toast.error(`Failed to validate files. Please try again.`);
    throw error;
  }
}

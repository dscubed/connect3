import { toast } from "sonner";
import { ValidationResult } from "./types";
import { useAuthStore } from "@/stores/authStore";

export async function validateFiles(
  parsedFiles: Array<{ file: File; text: string }>
): Promise<boolean> {
  try {
    const { profile: user, makeAuthenticatedRequest } = useAuthStore.getState();
    const fullName = `${user?.first_name} ${user?.last_name}`;

    for (const { file, text } of parsedFiles) {
      const res = await makeAuthenticatedRequest("/api/validate", {
        method: "POST",
        body: JSON.stringify({ text, fullName }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Authentication failed. Please log in again.");
          throw new Error("Authentication failed");
        }
        if (res.status === 429) {
          toast.error("Too many requests. Please wait before trying again.");
          throw new Error("Rate limit exceeded");
        }
        throw new Error(`Validation failed with status ${res.status}`);
      }

      const validation: ValidationResult = await res.json();

      if (!validation.safe || !validation.relevant) {
        toast.error(
          `${file.name} rejected: ${
            !validation.safe ? "unsafe content" : "not relevant"
          } (${validation.reason || "No reason provided"})`
        );
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

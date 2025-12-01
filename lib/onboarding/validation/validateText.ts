import { toast } from "sonner";
import { TextValidationResult } from "./types";
import { useAuthStore } from "@/stores/authStore";

export async function validateText(text: string): Promise<boolean> {
  try {
    const { profile, makeAuthenticatedRequest } = useAuthStore.getState();
    const fullName = `${profile?.first_name} ${profile?.last_name}`;
    const res = await makeAuthenticatedRequest("/api/validate/text", {
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

    const validation: TextValidationResult = await res.json();

    if (!validation.safe || !validation.relevant || !validation.belongsToUser || validation.templateResume) {
      let message = "Text rejected: ";

      if (!validation.safe) message += "unsafe content";
      else if (!validation.relevant) message += "not relevant";
      else if (!validation.belongsToUser) message += "text refers to a different person";
      else if (validation.templateResume) message += "resume appears to be a template or mostly placeholder content";

      message += ` (${validation.reason || "No explanation provided"})`;

      toast.error(message);
      return false;
    }

    return true;
  } catch (error) {
    toast.error(`Failed to validate text. Error: ${error}`);
    console.error(`Error validating text:`, error);
    return false;
  }
}

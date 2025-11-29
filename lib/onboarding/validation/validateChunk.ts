import { toast } from "sonner";
import { ChunkValidationResult } from "./types";
import { useAuthStore } from "@/stores/authStore";
import { Chunk } from "@/components/onboarding/chunks/utils/ChunkUtils";

export async function validateChunk(chunk: Chunk): Promise<boolean> {
  try {
    const { profile, makeAuthenticatedRequest } = useAuthStore.getState();

    const text = `Category:${chunk.category}\n${chunk.content}`;

    const fullName = `${profile?.first_name} ${profile?.last_name}`;
    const res = await makeAuthenticatedRequest("/api/validate/chunks", {
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

    const validation: ChunkValidationResult = await res.json();

    if (!validation.safe || !validation.relevant || !validation.belongsToUser
      || !validation.categoryValid || !validation.categoryMatchesContent) {
      toast.error(
        `Text rejected: ${
          !validation.safe ? "unsafe content" : "not relevant"
        } (${validation.reason || "No reason provided"})`
      );
      return false;
    }

    if (validation.sensitive) {
      toast.warning(
        `The text may contain sensitive content: ${
          validation.reason || "No reason provided"
        }`
      );
    }

    return true;
  } catch (error) {
    toast.error(`Failed to validate text. Error: ${error}`);
    console.error(`Error validating text:`, error);
    return false;
  }
}

import { toast } from "sonner";
import { ValidationResult } from "./types";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export async function validateFiles(
  parsedFiles: Array<{ file: File; text: string }>
): Promise<boolean> {
  try {
    // Get auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      toast.error("Authentication required. Please log in.");
      throw new Error("No authentication token");
    }

    const user = useAuthStore.getState().profile;
    const fullName = `${user?.first_name} ${user?.last_name}`;

    for (const { file, text } of parsedFiles) {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // Add auth header
        },
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

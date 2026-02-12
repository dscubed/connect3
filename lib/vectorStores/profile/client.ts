import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export async function uploadProfileToVectorStore() {
  const { makeAuthenticatedRequest, user } = useAuthStore.getState();

  if (!user) {
    toast.error("User not authenticated");
    return;
  }

  // Show loading toast and get its id
  const toastId = toast.loading("Uploading profile to vector store...");

  try {
    const response = await makeAuthenticatedRequest(
      "/api/vector-store/uploadProfile",
      {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to enqueue profile upload");
    }
    // 202 Accepted — job is queued, worker will process it
    toast.success("Profile upload queued — it will be processed shortly", {
      id: toastId,
    });
  } catch (e) {
    console.error("Error enqueuing profile upload:", e);
    toast.error("Failed to upload profile to vector store", { id: toastId });
  }
}

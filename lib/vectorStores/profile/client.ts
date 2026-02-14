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
      
      // Handle specific 409 conflict error (upload already in progress)
      if (response.status === 409) {
        toast.error("Profile upload already in progress. Please wait.", {
          id: toastId,
        });
        return;
      }
      
      throw new Error(errorData.error || "Failed to upload profile");
    }
    
    toast.success("Profile uploaded successfully to vector store", {
      id: toastId,
    });
  } catch (e) {
    console.error("Error uploading profile:", e);
    toast.error("Failed to upload profile to vector store", { id: toastId });
  }
}

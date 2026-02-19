import { useAuthStore } from "@/stores/authStore";

export async function uploadProfileToVectorStore() {
  const { makeAuthenticatedRequest, user } = useAuthStore.getState();

  if (!user) {
    return;
  }

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
      throw new Error(errorData.error || "Failed to upload profile");
    }
  } catch (e) {
    console.error("Error uploading profile:", e);
  }
}

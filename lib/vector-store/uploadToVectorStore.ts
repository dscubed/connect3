import { useAuthStore } from "@/stores/authStore";

export const uploadToVectorStore = async (
  userId: string,
  summaryText: string
) => {
  try {
    const response = await useAuthStore
      .getState()
      .makeAuthenticatedRequest("/api/vector-store/upload", {
        method: "POST",
        body: JSON.stringify({
          userId,
          summaryText,
        }),
      });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Vector store upload error:", error);
    throw error;
  }
};

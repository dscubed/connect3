export const uploadToVectorStore = async (
  userId: string,
  summaryText: string
) => {
  try {
    const response = await fetch("/api/vector-store/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

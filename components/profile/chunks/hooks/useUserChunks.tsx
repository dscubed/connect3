import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

interface UserChunk {
  id: string;
  user_id: string;
  openai_file_id: string;
  summary_text: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useUserChunks(userId?: string) {
  const [chunks, setChunks] = useState<UserChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChunks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching chunks for user:", userId);

      const response = await useAuthStore
        .getState()
        .makeAuthenticatedRequest(`/api/profiles/getChunks?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch chunks");
      }

      const data = await response.json();
      setChunks(data.chunks || []);
    } catch (err) {
      console.error("Error fetching chunks:", err);
      setError("Failed to load chunks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChunks();
  }, [userId]);

  return { chunks, loading, error, refetch: fetchChunks };
}

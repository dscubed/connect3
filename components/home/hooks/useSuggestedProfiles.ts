import { useState, useEffect } from "react";
import { Profile } from "@/components/home/ProfileCard";

export function useSuggestedProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestedProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching suggested profiles");

      // Use regular fetch since this endpoint doesn't require authentication
      const response = await fetch("/api/suggested/people");

      if (!response.ok) {
        throw new Error("Failed to fetch suggested profiles");
      }

      const data = await response.json();

      console.log("Suggested profiles fetched:", data);

      if (data.success) {
        setProfiles(data.profiles || []);
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error fetching suggested profiles:", err);
      setError("Failed to load suggested profiles");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedProfiles();
  }, []);

  return { profiles, loading, error, refetch: fetchSuggestedProfiles };
}

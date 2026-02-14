import { SearchBarUI } from "./SearchBarUI";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { createChatroom } from "@/lib/chatrooms/chatroomUtils";

interface SearchBarProps {
  containerClassName?: string;
}

export function SearchBar({ containerClassName }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [creatingChatroom, setCreatingChatroom] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    []
  );
  const router = useRouter();

  const handleUniversityChange = useCallback((uni: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(uni) ? prev.filter((u) => u !== uni) : [...prev, uni]
    );
  }, []);

  const handleUniversityClear = useCallback(() => {
    setSelectedUniversities([]);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setCreatingChatroom(true);
    try {
      const userId = useAuthStore.getState().user?.id;
      // Fix: Import and get supabase client instance, then use it for anonymous sign in
      if (!userId) {
        toast.info("Creating guest session...");
        const supabase = useAuthStore.getState().getSupabaseClient();
        const { error } = await supabase.auth.signInAnonymously();
        console.log("Guest session created:", error);
        if (error) {
          toast.error("Failed to create guest session. Please try again.");
          setCreatingChatroom(false);
          return;
        }
      }

      const createResponse = await createChatroom(
        searchQuery,
        selectedUniversities.length > 0 ? selectedUniversities : undefined,
      );

      if (!createResponse) {
        setCreatingChatroom(false);
        return;
      }
      const { chatroomId } = createResponse;

      router.push(`/search?chatroom=${chatroomId}`);
    } catch (error) {
      console.error("Error creating chatroom:", error);
      toast.error("Failed to create chatroom. Please try again.");
      setCreatingChatroom(false);
    }
  };

  return (
    <SearchBarUI
      query={query}
      setQuery={setQuery}
      disabled={creatingChatroom}
      onSubmit={handleSearch}
      containerClassName={containerClassName}
      selectedUniversities={selectedUniversities}
      onUniversityChange={handleUniversityChange}
      onUniversityClear={handleUniversityClear}
    />
  );
}

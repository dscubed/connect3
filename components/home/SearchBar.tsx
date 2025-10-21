import { SearchBarUI } from "./SearchBarUI";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  createChatroom,
  triggerBackgroundSearch,
} from "@/lib/chatrooms/chatroomUtils";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [creatingChatroom, setCreatingChatroom] = useState(false);
  const router = useRouter();

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
        console.log("🚀 Guest session created:", error);
        if (error) {
          toast.error("Failed to create guest session. Please try again.");
          setCreatingChatroom(false);
          return;
        }
      }

      console.log("🚀 Creating chatroom for query:", searchQuery);

      const { chatroomId, messageId } = await createChatroom(searchQuery);

      // Navigate immediately
      router.push(`/search?chatroom=${chatroomId}`);

      // Trigger background search (fire and forget)
      triggerBackgroundSearch(messageId);
    } catch (error) {
      console.error("❌ Error creating chatroom:", error);
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
    />
  );
}

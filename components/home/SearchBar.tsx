import { SearchBarUI } from "./SearchBarUI";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { createChatroom } from "@/lib/chatrooms/chatroomUtils";
import { universities } from "@/components/profile/details/univeristies";

const ALL_UNIVERSITIES = Object.keys(universities).filter(
  (key) => key !== "others"
);
const STORAGE_KEY = "uni-preferences";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";

const allSuggestions = [
  "Find clubs related to AI and machine learning",
  "Show me upcoming networking events",
  "Find students interested in web development",
  "What events are happening on campus this week?",
  "Find people who play basketball",
  "Show me music and arts societies",
  "Find students looking for project partners",
  "Show me entrepreneurship and startup clubs",
  "Find photography or film clubs",
  "What social events are coming up this month?",
  "Show me debate or public speaking clubs",
  "Find students interested in data science",
  "Are there any clubs for creative writing?",
  "Find people studying computer science",
  "Show me sports and fitness clubs",
  "Find clubs focused on sustainability",
  "What engineering clubs are on campus?",
  "Find people interested in design and UX",
  "Show me cultural and language clubs",
  "Find clubs for board games or tabletop gaming",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface SearchBarProps {
  containerClassName?: string;
}

export function SearchBar({ containerClassName }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [creatingChatroom, setCreatingChatroom] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    () => [],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedUniversities(parsed);
      } else {
        setSelectedUniversities(ALL_UNIVERSITIES);
      }
    } catch {
      setSelectedUniversities(ALL_UNIVERSITIES);
    }
  }, []);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestions(pickRandom(allSuggestions, 5));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUniversities));
  }, [selectedUniversities]);

  const handleUniversityChange = useCallback((uni: string) => {
    if (uni == "all") {
      setSelectedUniversities(ALL_UNIVERSITIES);
      return;
    }

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
    <div className="flex flex-col gap-3 w-full">
      {suggestions.length > 0 && (
        <Suggestions className="mx-auto max-w-3xl">
          {suggestions.map((s) => (
            <Suggestion
              key={s}
              suggestion={s}
              onClick={handleSearch}
            />
          ))}
        </Suggestions>
      )}
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
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBarUI } from "../home/SearchBarUI";
import { useAuthStore } from "@/stores/authStore";
import { universities } from "@/components/profile/details/univeristies";

const ALL_UNIVERSITIES = Object.keys(universities).filter(
  (key) => key !== "others",
);

const STORAGE_KEY = "uni-preferences";

interface ChatRoomSearchBarProps {
  chatroomId: string | null;
  addNewMessage: (query: string, universities?: string[]) => void;
  inFlight?: boolean;
}

export function ChatRoomSearchBar({
  chatroomId,
  addNewMessage,
  inFlight = false,
}: ChatRoomSearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed; }
      } catch { /* ignore */ }
      return [];
    },
  );
  const dirty = useRef(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getSupabaseClient = useAuthStore((s) => s.getSupabaseClient);

  useEffect(() => {
    dirty.current = false;
    if (!chatroomId) return;
    let cancelled = false;
    getSupabaseClient()
      .from("chatrooms")
      .select("universities")
      .eq("id", chatroomId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const stored = data?.universities;
        if (typeof stored === "string" && stored.length > 0) {
          setSelectedUniversities(stored.split(","));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatroomId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUniversities));
    if (!dirty.current || !chatroomId) return;
    pendingTimer.current = setTimeout(() => {
      pendingTimer.current = null;
      getSupabaseClient()
        .from("chatrooms")
        .update({ universities: selectedUniversities.join(",") })
        .eq("id", chatroomId)
        .then();
    }, 500);
    return () => {
      if (pendingTimer.current) {
        clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUniversities]);

  const handleUniversityChange = useCallback((uni: string) => {
    dirty.current = true;
    if (uni == "all") {
      setSelectedUniversities(ALL_UNIVERSITIES);
      return;
    }

    setSelectedUniversities((prev) =>
      prev.includes(uni) ? prev.filter((u) => u !== uni) : [...prev, uni],
    );
  }, []);

  const handleUniversityClear = useCallback(() => {
    dirty.current = true;
    setSelectedUniversities([]);
  }, []);

  const handleSubmit = async (submittedQuery: string) => {
    if (submittedQuery.trim() === "" || inFlight) return;
    if (pendingTimer.current && chatroomId) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
      getSupabaseClient()
        .from("chatrooms")
        .update({ universities: selectedUniversities.join(",") })
        .eq("id", chatroomId)
        .then();
    }
    setQuery("");
    addNewMessage(
      submittedQuery,
      selectedUniversities.length > 0 ? selectedUniversities : undefined,
    );
  };

  if (!chatroomId) return null;

  return (
    <SearchBarUI
      query={query}
      setQuery={setQuery}
      disabled={inFlight}
      isLoading={inFlight}
      onSubmit={handleSubmit}
      selectedUniversities={selectedUniversities}
      onUniversityChange={handleUniversityChange}
      onUniversityClear={handleUniversityClear}
    />
  );
}

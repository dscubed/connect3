"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { EntityResult, EntityType } from "@/lib/search/types";
import MatchResults from "@/components/search/MatchResult/MatchResults";
import { SearchBarUI } from "@/components/home/SearchBarUI";
import { createChatroom } from "@/lib/chatrooms/chatroomUtils";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

const ProfileSheet = dynamic(
  () =>
    import("@/components/search/ProfileSheet").then((mod) => mod.ProfileSheet),
  { ssr: false },
);
const EventSheet = dynamic(
  () => import("@/components/search/EventSheet").then((mod) => mod.EventSheet),
  { ssr: false },
);

type SheetState = {
  type: "profile" | "event" | null;
  id: string | null;
};

interface SearchResult {
  id: string;
  type: string;
  score: number;
  content: string;
}

export default function SearchPageContent() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState>({ type: null, id: null });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState("");
  const [startingChat, setStartingChat] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const q = mounted ? searchParams?.get("q") || "" : "";

  const handleProfileClick = useCallback((entity: EntityResult) => {
    setSheet({
      type: entity.type === "events" ? "event" : "profile",
      id: entity.id,
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet({ type: null, id: null });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Run search when q param changes
  useEffect(() => {
    if (!q) return;
    setQuery(q);

    const runSearch = async () => {
      setLoading(true);
      setSearched(false);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    };

    runSearch();
  }, [q]);

  const handleNewSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    },
    [router],
  );

  const handleStartChat = useCallback(async () => {
    if (!q.trim()) return;
    setStartingChat(true);
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        const supabase = useAuthStore.getState().getSupabaseClient();
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          toast.error("Failed to create guest session.");
          setStartingChat(false);
          return;
        }
      }

      const createResponse = await createChatroom(q);
      if (!createResponse) {
        setStartingChat(false);
        return;
      }
      router.push(`/chat/${createResponse.chatroomId}`);
    } catch (err) {
      console.error("Error creating chatroom:", err);
      toast.error("Failed to start chat.");
      setStartingChat(false);
    }
  }, [q, router]);

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <CubeLoader size={48} />
      </div>
    );
  }

  const entityResults: EntityResult[] = results.map((r) => ({
    type: r.type as EntityType,
    id: r.id,
  }));

  const chatBanner = (
    <button
      onClick={handleStartChat}
      disabled={startingChat}
      className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-100 transition-colors disabled:opacity-50"
    >
      <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <span className="text-sm text-blue-800">
        Still not finding what you&apos;re looking for?{" "}
        <span className="font-semibold underline">Start a chat</span>
      </span>
    </button>
  );

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      <div className="flex flex-col md:flex-row relative z-10 w-full h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 min-w-0 min-h-0 md:pt-12 relative flex flex-col items-center">
          <div
            className="flex-1 overflow-y-auto px-4 pb-36 w-full"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="max-w-3xl mx-auto pt-6 space-y-6">
              {q && (
                <h1 className="text-xl font-semibold text-secondary-foreground">
                  Results for &ldquo;{q}&rdquo;
                </h1>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <CubeLoader size={40} />
                </div>
              )}

              {searched && !loading && results.length === 0 && (
                <>
                  <p className="text-muted-foreground py-8 text-center">
                    No results found. Try a different search or start a chat.
                  </p>
                  {chatBanner}
                </>
              )}

              {!loading && results.length > 0 && (
                <>
                  {chatBanner}
                  <div className="flex flex-wrap gap-4">
                    {entityResults.map((entity, i) => (
                      <MatchResults
                        key={`${entity.type}-${entity.id}`}
                        match={entity}
                        userIndex={i}
                        onProfileClick={handleProfileClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fixed search bar at bottom */}
          <div className="w-full px-4 absolute bottom-0">
            <div className="bg-white h-full pb-4">
              <SearchBarUI
                query={query}
                setQuery={setQuery}
                onSubmit={handleNewSearch}
                containerClassName="rounded-3xl border border-gray-200 p-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]"
              />
            </div>
          </div>
        </main>
      </div>

      <ProfileSheet
        profileId={sheet.type === "profile" ? sheet.id : null}
        isOpen={sheet.type === "profile"}
        onClose={closeSheet}
      />
      <EventSheet
        eventId={sheet.type === "event" ? sheet.id : null}
        isOpen={sheet.type === "event"}
        onClose={closeSheet}
      />
    </div>
  );
}

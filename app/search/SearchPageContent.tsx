"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { EntityResult, EntityType } from "@/lib/search/types";
import SearchMatchResults from "@/components/search/MatchResult/SearchMatchResults";
import { SearchInput } from "@/components/search/SearchInput";
import { createChatroom } from "@/lib/chatrooms/chatroomUtils";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ProfileSheet = dynamic(
  () => import("@/components/search/ProfileSheet").then((m) => m.ProfileSheet),
  { ssr: false },
);
const EventSheet = dynamic(
  () => import("@/components/search/EventSheet").then((m) => m.EventSheet),
  { ssr: false },
);

type SheetState = { type: "profile" | "event" | null; id: string | null };

interface SearchResult {
  id: string;
  type: string;
  score: number;
  content: string;
}

type TabType = "all" | "people" | "clubs" | "events";

const TABS: { label: string; value: TabType }[] = [
  { label: "All", value: "all" },
  { label: "People", value: "people" },
  { label: "Clubs", value: "clubs" },
  { label: "Events", value: "events" },
];

const TAB_TYPES: Record<TabType, EntityType[]> = {
  all: ["user", "organisation", "events"],
  people: ["user"],
  clubs: ["organisation"],
  events: ["events"],
};

const PAGE_SIZE = 10;

export default function SearchPageContent() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState>({ type: null, id: null });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const q = mounted ? searchParams?.get("q") || "" : "";
  const tab = mounted ? (searchParams?.get("type") as TabType) || "all" : "all";
  const page = mounted
    ? Math.max(1, Number(searchParams?.get("page") || "1"))
    : 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-fetch whenever q changes
  useEffect(() => {
    if (!q) return;
    const run = async () => {
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
    run();
  }, [q]);

  // Build URL helper — keeps all current params, overrides specified ones
  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tab !== "all") params.set("type", tab);
      if (page !== 1) params.set("page", String(page));
      for (const [k, v] of Object.entries(overrides)) {
        if (v === null) params.delete(k);
        else params.set(k, v);
      }
      return `/search?${params.toString()}`;
    },
    [q, tab, page],
  );

  const handleNewSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      const params = new URLSearchParams({ q: searchQuery.trim() });
      if (tab !== "all") params.set("type", tab);
      router.push(`/search?${params.toString()}`);
    },
    [router, tab],
  );

  const handleTabChange = useCallback(
    (value: TabType) => {
      // Reset to page 1 when switching tabs
      const params = new URLSearchParams({ q });
      if (value !== "all") params.set("type", value);
      router.push(`/search?${params.toString()}`, { scroll: false } as never);
    },
    [router, q],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      router.push(buildUrl({ page: next === 1 ? null : String(next) }), {
        scroll: false,
      } as never);
      resultsTopRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    [router, buildUrl],
  );

  const handleProfileClick = useCallback((entity: EntityResult) => {
    setSheet({
      type: entity.type === "events" ? "event" : "profile",
      id: entity.id,
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet({ type: null, id: null });
  }, []);

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
      const res = await createChatroom(q);
      if (!res) {
        setStartingChat(false);
        return;
      }
      router.push(`/chat/${res.chatroomId}`);
    } catch {
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

  // Filter by tab, then paginate
  const allowedTypes = TAB_TYPES[tab];
  const filteredResults: EntityResult[] = results
    .filter((r) => allowedTypes.includes(r.type as EntityType))
    .map((r) => ({ type: r.type as EntityType, id: r.id }));

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageResults = filteredResults.slice(
    (clampedPage - 1) * PAGE_SIZE,
    clampedPage * PAGE_SIZE,
  );

  const chatBanner = (
    <button
      onClick={handleStartChat}
      disabled={startingChat}
      className="w-full rounded-xl max-w-3xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-100 transition-colors disabled:opacity-50"
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

        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          {/* Top header: */}
          <div className="px-4 pt-4 md:pt-8 pb-2">
            <SearchInput defaultValue={q} onSubmit={handleNewSearch} />
          </div>

          {/* Results */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-6 py-2"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="flex gap-6 mb-3 px-4 border-b border-muted/20">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTabChange(t.value)}
                  className={cn(
                    "py-1.5 text-sm transition-colors",
                    tab === t.value
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div ref={resultsTopRef} className="space-y-6 pb-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <CubeLoader size={40} />
                </div>
              )}

              {searched && !loading && filteredResults.length === 0 && (
                <>
                  {chatBanner}
                  <p className="text-muted-foreground py-8 text-center">
                    No results found. Try a different search or start a chat.
                  </p>
                </>
              )}

              {!loading && pageResults.length > 0 && (
                <>
                  {chatBanner}
                  <div className="space-y-3 max-w-xl">
                    {pageResults.map((entity, i) => (
                      <SearchMatchResults
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 px-8 border-t border-muted/20">
                {/* Page indicator */}
                <span className="text-xs text-muted-foreground">
                  Page {clampedPage} of {totalPages}
                </span>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(clampedPage - 1)}
                    disabled={clampedPage === 1}
                    className="p-1 rounded-md hover:bg-secondary-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={cn(
                          "w-7 h-7 text-xs rounded-md transition-colors",
                          p === clampedPage
                            ? "text-foreground"
                            : "hover:text-secondary-foreground/60 text-secondary-foreground",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => handlePageChange(clampedPage + 1)}
                    disabled={clampedPage === totalPages}
                    className="p-1 rounded-md hover:bg-secondary-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Ghost div for spacing */}
                <div />
              </div>
            )}
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

"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { ClubDetailPanel } from "@/components/clubs/ClubDetailPanel";
import { ClubsHeader } from "@/components/clubs/HeaderSection";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { Club } from "@/types/clubs/club";
import { useBreakpointLarge } from "@/hooks/useMediaQuery";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";
import { ClubListCard } from "@/components/clubs/ClubListCard";
import ClubFilters from "@/components/clubs/ClubFilters";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function ClubsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedUniversity, setSelectedUniversity] = useState<string>(
    searchParams.get("university") ?? "All",
  );

  const debouncedSearch = useDebouncedValue(search, 300);

  const clubListRef = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpointLarge();

  const buildQueryString = useCallback(
    (overrides: Record<string, string | null> = {}) => {
      const params = new URLSearchParams();
      const s =
        overrides.search !== undefined ? overrides.search : debouncedSearch;
      const u =
        overrides.university !== undefined
          ? overrides.university
          : selectedUniversity;
      const c =
        overrides.club !== undefined
          ? overrides.club
          : (selectedClub?.id ?? null);
      if (s) params.set("search", s);
      if (u && u !== "All") params.set("university", u);
      if (c) params.set("club", c);
      const qs = params.toString();
      return qs ? `?${qs}` : "";
    },
    [debouncedSearch, selectedUniversity, selectedClub],
  );

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedUniversity && selectedUniversity !== "All")
      params.university = selectedUniversity;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearch, selectedUniversity]);

  const {
    items: clubs,
    error,
    isLoading,
    isValidating,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<Club>(clubListRef, "/api/clubs", { queryParams });

  // Sync search & university to URL (replace so filter changes don't spam history)
  useEffect(() => {
    const qs = buildQueryString();
    router.replace(`/clubs${qs}`, { scroll: false });
  }, [debouncedSearch, selectedUniversity, buildQueryString, router]);

  // Restore selected club from URL param once clubs load
  useEffect(() => {
    if (!loaded && !isLoading && clubs.length > 0) {
      const clubIdFromUrl = searchParams.get("club");
      const match = clubIdFromUrl
        ? clubs.find((c) => c.id === clubIdFromUrl)
        : null;
      setSelectedClub(match ?? clubs[0]);
      setShowDetails(!!match);
      setLoaded(true);
    }
  }, [isLoading, clubs, loaded, searchParams]);

  // Reset selection when current selection is no longer in the filtered list
  useEffect(() => {
    if (isValidating) return;
    const selectionStillValid =
      selectedClub && clubs.some((c) => c.id === selectedClub.id);
    if (!selectionStillValid) {
      setSelectedClub(clubs.length > 0 ? clubs[0] : null);
    }
  }, [clubs, isValidating, selectedClub]);

  const handleClubSelect = useCallback(
    (club: Club) => {
      setSelectedClub(club);
      setShowDetails(true);
      const qs = buildQueryString({ club: club.id });
      router.push(`/clubs${qs}`, { scroll: false });
    },
    [buildQueryString, router],
  );

  const handleBackToList = useCallback(() => {
    setShowDetails(false);
    const qs = buildQueryString({ club: null });
    router.push(`/clubs${qs}`, { scroll: false });
  }, [buildQueryString, router]);

  // Re-sync state only on browser back/forward (popstate), not on our own URL updates
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search") ?? "";
      const urlUni = params.get("university") ?? "All";
      const clubId = params.get("club");

      setSearch(urlSearch);
      setSelectedUniversity(urlUni);

      if (clubs.length > 0) {
        const match = clubId ? clubs.find((c) => c.id === clubId) : null;
        if (match) {
          setSelectedClub(match);
          setShowDetails(true);
        } else {
          setSelectedClub(clubs[0] ?? null);
          setShowDetails(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [clubs]);

  // Arrow key navigation through clubs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (clubs.length === 0) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      e.preventDefault();
      const currentIndex = selectedClub
        ? clubs.findIndex((c) => c.id === selectedClub.id)
        : -1;

      let nextIndex: number;
      if (e.key === "ArrowDown") {
        nextIndex =
          currentIndex < clubs.length - 1 ? currentIndex + 1 : currentIndex;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      }

      if (nextIndex !== currentIndex) {
        handleClubSelect(clubs[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clubs, selectedClub, handleClubSelect]);

  useEffect(() => {
    if (error) {
      toast.error("Could not get clubs");
    }
  }, [error]);

  // To fix flickering, render club lists as inline JSX instead of using a helper component
  // Reducing rerenders causing flickering
  const clubListContent = isLoading ? (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <CubeLoader size={32} />
      <p className="text-muted text-sm">Loading clubs...</p>
    </div>
  ) : clubs.length === 0 ? (
    <div className="p-4 text-sm text-muted">
      {debouncedSearch
        ? `No clubs found for "${debouncedSearch}"`
        : "No clubs found."}
    </div>
  ) : (
    <>
      {clubs.map((club) => (
        <ClubListCard
          key={club.id}
          club={club}
          isSelected={selectedClub?.id === club.id}
          onClick={() => handleClubSelect(club)}
        />
      ))}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden />}
      <div className="min-h-[48px] flex items-center justify-center py-4">
        {isValidating && <CubeLoader size={24} />}
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {isDesktop ? (
        // Desktop: Side by side layout
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Club List */}
          <div className="w-80 xl:w-96 border-r border-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
            <ClubsHeader clubCount={clubs.length} isLoading={isValidating} />
            <ClubFilters
              search={search}
              setSearch={setSearch}
              selectedUniversity={selectedUniversity}
              setSelectedUniversity={setSelectedUniversity}
            />

            {/* Club List */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
              ref={clubListRef}
            >
              {clubListContent}
            </div>
          </div>

          {/* Right Panel - Club Details */}
          <div className="flex-1 overflow-hidden">
            <div
              className="h-full overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.3) transparent",
              }}
            >
              <AnimatePresence mode="wait">
                {selectedClub ? (
                  <ClubDetailPanel club={selectedClub} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted">
                    {isLoading ? "Loading..." : "Select a club to view details"}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        // Mobile: Show either list or details
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {!showDetails ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col backdrop-blur-sm"
              >
                <ClubsHeader
                  clubCount={clubs.length}
                  isLoading={isValidating}
                />
                <ClubFilters
                  search={search}
                  setSearch={setSearch}
                  selectedUniversity={selectedUniversity}
                  setSelectedUniversity={setSelectedUniversity}
                />

                {/* Club List */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
                  ref={clubListRef}
                >
                  {clubListContent}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full overflow-hidden"
              >
                <div
                  className="h-full overflow-y-auto"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.3) transparent",
                  }}
                >
                  {selectedClub && (
                    <ClubDetailPanel
                      club={selectedClub}
                      onBack={handleBackToList}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

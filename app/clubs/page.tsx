"use client";
import { useState, useEffect, useRef, useMemo } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("All");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebouncedValue(search, 300);

  const clubListRef = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpointLarge();

  // Memoize query params to prevent unnecessary re-fetches
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
  } = useInfiniteScroll<Club>(clubListRef, "/api/clubs", { queryParams });

  // Set initial selected club once data loads
  useEffect(() => {
    if (!loaded && !isLoading && clubs.length > 0) {
      setSelectedClub(clubs[0]);
      setLoaded(true);
    }
  }, [isLoading, clubs, loaded]);

  // Reset selection when current selection is no longer in the filtered list
  useEffect(() => {
    if (isValidating) return;
    const selectionStillValid =
      selectedClub && clubs.some((c) => c.id === selectedClub.id);
    if (!selectionStillValid) {
      setSelectedClub(clubs.length > 0 ? clubs[0] : null);
    }
  }, [clubs, isValidating, selectedClub]);

  const handleClubSelect = (club: Club) => {
    setSelectedClub(club);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  // Handle error with useEffect to avoid calling toast during render
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
      {isValidating && (
        <div className="flex justify-center py-4">
          <CubeLoader size={24} />
        </div>
      )}
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
              className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide"
              ref={clubListRef}
            >
              {clubListContent}
            </div>
          </div>

          {/* Right Panel - Club Details */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
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
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-hide"
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
                <div className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-hide">
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

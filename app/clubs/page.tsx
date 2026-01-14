"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { ClubDetailPanel } from "@/components/clubs/ClubDetailPanel";
import { ClubsHeader } from "@/components/clubs/HeaderSection";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { Club } from "@/types/clubs/club";
import { breakpointLarge } from "@/hooks/useMediaQuery";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";
import { ClubListCard } from "@/components/clubs/ClubListCard";

export default function ClubsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const clubListRef = useRef<HTMLDivElement>(null);
  const isDesktop = breakpointLarge();

  const {
    items: clubs,
    error,
    isLoading,
    isValidating,
  } = useInfiniteScroll<Club>(clubListRef, "/api/clubs");

  // Set initial selected club once data loads
  useEffect(() => {
    if (!loaded && !isLoading && clubs.length > 0) {
      setSelectedClub(clubs[0]);
      setLoaded(true);
    }
  }, [isLoading, clubs, loaded]);

  const handleClubSelect = (club: Club) => {
    setSelectedClub(club);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  if (error) {
    toast.error("Could not get clubs");
  }

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="min-h-screen w-full flex flex-col justify-center items-center">
          <CubeLoader size={32} />
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {isDesktop ? (
        // Desktop: Side by side layout
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Club List */}
          <div className="w-80 xl:w-96 border-r border-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
            <ClubsHeader clubCount={clubs.length} isLoading={isValidating} />

            {/* Club List */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide"
              ref={clubListRef}
            >
              {clubs.map((club) => (
                <ClubListCard
                  key={club.id}
                  club={club}
                  isSelected={selectedClub?.id === club.id}
                  onClick={() => handleClubSelect(club)}
                />
              ))}

              {clubs.length === 0 && (
                <div className="p-4 text-sm text-muted">No clubs found.</div>
              )}

              {isValidating && (
                <div className="flex justify-center">
                  <CubeLoader size={32} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Club Details */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
              <AnimatePresence mode="wait">
                {selectedClub && <ClubDetailPanel club={selectedClub} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        // Mobile: Show either list or details
        <div className="flex-1 flex flex-col overflow-hidden">
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

                {/* Club List */}
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-hide"
                  ref={clubListRef}
                >
                  {clubs.map((club) => (
                    <ClubListCard
                      key={club.id}
                      club={club}
                      isSelected={selectedClub?.id === club.id}
                      onClick={() => handleClubSelect(club)}
                    />
                  ))}

                  {clubs.length === 0 && (
                    <div className="p-4 text-sm text-white/60">
                      No clubs found.
                    </div>
                  )}

                  {isValidating && (
                    <div className="flex justify-center">
                      <CubeLoader size={32} />
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full bg-black overflow-hidden"
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

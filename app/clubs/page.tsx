"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { clubsData, type ClubData } from "@/components/clubs/ClubsData";
import { ClubListCard } from "@/components/clubs/ClubListCard";
import { ClubDetailPanel } from "@/components/clubs/ClubDetailPanel";
import { ClubsHeader } from "@/components/clubs/HeaderSection";

export default function ClubsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubData>(clubsData[0]);
  const [showDetails, setShowDetails] = useState(false);

  const handleClubSelect = (club: ClubData) => {
    setSelectedClub(club);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile: Show either list or details */}
        <div className="lg:hidden flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {!showDetails ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col bg-black/50 backdrop-blur-sm"
              >
                {/* Header */}
                <ClubsHeader clubCount={clubsData.length} />

                {/* Club List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-hide">
                  {clubsData.map((club) => (
                    <ClubListCard
                      key={club.id}
                      club={club}
                      isSelected={selectedClub.id === club.id}
                      onClick={() => handleClubSelect(club)}
                    />
                  ))}
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
                  <ClubDetailPanel
                    club={selectedClub}
                    onBack={handleBackToList}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop: Side by side layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          {/* Left Panel - Club List */}
          <div className="w-96 xl:w-[450px] border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex flex-col">
            {/* Header */}
            <ClubsHeader clubCount={clubsData.length} />

            {/* Club List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
              {clubsData.map((club) => (
                <ClubListCard
                  key={club.id}
                  club={club}
                  isSelected={selectedClub.id === club.id}
                  onClick={() => setSelectedClub(club)}
                />
              ))}
            </div>
          </div>

          {/* Right Panel - Club Details */}
          <div className="flex-1 bg-black overflow-hidden">
            <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
              <AnimatePresence mode="wait">
                <ClubDetailPanel club={selectedClub} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { clubsData, type ClubData } from "@/components/clubs/ClubsData";
import { Category } from "@/components/clubs/ClubsData";
import { ClubListCard } from "@/components/clubs/ClubListCard";
import { ClubDetailPanel } from "@/components/clubs/ClubDetailPanel";
import { ClubsHeader } from "@/components/clubs/HeaderSection";
import ClubFilters from "@/components/clubs/ClubFilters";

export default function ClubsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubData>(clubsData[0]);
  const [showDetails, setShowDetails] = useState(false);

  // Search and category filter state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    "All"
  );

  // Get all unique categories from clubsData
  const categoryOptions: (Category | "All")[] = [
    "All",
    ...Array.from(
      new Set(clubsData.flatMap((club) => club.category ?? []))
    ).sort(),
  ];

  // Filter clubs by search and category
  const filteredClubs = clubsData.filter((club) => {
    const matchesSearch =
      search.trim() === "" ||
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      (club.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      club.description.toLowerCase().includes(search.toLowerCase()) ||
      club.fullDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (club.category ?? []).includes(selectedCategory as Category);
    return matchesSearch && matchesCategory;
  });

  // Ensure selectedClub is always in filteredClubs
  useEffect(() => {
    if (filteredClubs.length === 0) return;
    if (!filteredClubs.find((c) => c.id === selectedClub.id)) {
      setSelectedClub(filteredClubs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory]);

  const handleClubSelect = (club: ClubData) => {
    setSelectedClub(club);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
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
                className="h-full flex flex-col backdrop-blur-sm"
              >
                {/* Header */}
                <ClubsHeader clubCount={clubsData.length} />

                {/* Search and Category Filter */}
                <ClubFilters
                  search={search}
                  setSearch={setSearch}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categoryOptions={categoryOptions}
                />

                {/* Club List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-hide">
                  {filteredClubs.map((club) => (
                    <ClubListCard
                      key={club.id}
                      club={club}
                      isSelected={selectedClub.id === club.id}
                      onClick={() => handleClubSelect(club)}
                    />
                  ))}
                  {filteredClubs.length === 0 && (
                    <div className="p-4 text-sm text-white/60">
                      No clubs match your search / filter.
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
                className="h-full overflow-hidden"
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
          <div className="w-80 xl:w-96 border-r border-black/10 backdrop-blur-sm overflow-hidden flex flex-col">
            {/* Header */}
            <ClubsHeader clubCount={clubsData.length} />

            {/* Search and Category Filter */}
            <ClubFilters
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryOptions={categoryOptions}
            />

            {/* Club List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
              {filteredClubs.map((club) => (
                <ClubListCard
                  key={club.id}
                  club={club}
                  isSelected={selectedClub.id === club.id}
                  onClick={() => setSelectedClub(club)}
                />
              ))}
              {filteredClubs.length === 0 && (
                <div className="p-4 text-sm text-white/60">
                  No clubs match your search / filter.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Club Details */}
          <div className="flex-1 overflow-hidden">
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

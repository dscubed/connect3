"use client";
import { useState, useEffect } from "react";
import { EventCategory } from "@/types/events/event";
import Sidebar from "@/components/sidebar/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import EventsHeader from "@/components/events/HeaderSection";

export default function EventsPage() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [selectedClub, setSelectedClub] = useState<Event>(clubsData[0]);
  // const [showDetails, setShowDetails] = useState(false);

  // // Search and category filter state
  // const [search, setSearch] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">(
  //   "All"
  // );

  // const categoryOptions: (EventCategory | "All")[] = [
  //   "All",
  //   ...Array.from(
  //     new Set(clubsData.flatMap((club) => club.category ?? []))
  //   ).sort(),
  // ];

  // // Filter clubs by search and category
  // const filteredClubs = clubsData.filter((club) => {
  //   const matchesSearch =
  //     search.trim() === "" ||
  //     club.name.toLowerCase().includes(search.toLowerCase()) ||
  //     (club.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
  //     club.description.toLowerCase().includes(search.toLowerCase()) ||
  //     club.fullDescription.toLowerCase().includes(search.toLowerCase());
  //   const matchesCategory =
  //     selectedCategory === "All" ||
  //     (club.category ?? []).includes(selectedCategory as Category);
  //   return matchesSearch && matchesCategory;
  // });

  // // Ensure selectedClub is always in filteredClubs
  // useEffect(() => {
  //   if (filteredClubs.length === 0) return;
  //   if (!filteredClubs.find((c) => c.id === selectedClub.id)) {
  //     setSelectedClub(filteredClubs[0]);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [search, selectedCategory]);

  // useEffect(() => {
  //   // pull data from database
  // }, [])

  // const handleClubSelect = (club: ClubData) => {
  //   setSelectedClub(club);
  //   setShowDetails(true);
  // };

  // const handleBackToList = () => {
  //   setShowDetails(false);
  // };

  useEffect(() => {
    const effect = async () => {
      const response = await fetch(process.env.NODE_ENV === "development" ? 
        "http://localhost:3000/api/events/ad123ea1-1763-469a-9e82-28d80a06745f" : 
        `https://connect3/api/event/ad123ea1-1763-469a-9e82-28d80a06745f`)
      
      if (!response.ok) {
        console.error("Could not fetch event");
      }
    }

    effect();
    return () => {

    }
  }, [])
  // return (
  //   <div className="flex h-screen bg-black overflow-hidden">
  //     {/* Sidebar */}
  //     <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

  //     {/* Main Content Area */}
  //     <div className="flex-1 flex flex-col overflow-hidden">
  //       {/* Mobile: Show either list or details */}
  //       <div className="lg:hidden flex-1 overflow-hidden">
  //         <AnimatePresence mode="wait">
  //           {!showDetails ? (
  //             <motion.div
  //               key="list"
  //               initial={{ opacity: 0, x: -20 }}
  //               animate={{ opacity: 1, x: 0 }}
  //               exit={{ opacity: 0, x: -20 }}
  //               className="h-full flex flex-col bg-black/50 backdrop-blur-sm"
  //             >
  //               {/* Header */}
  //               <EventsHeader eventCount={clubsData.length} />

  //               {/* Search and Category Filter */}
  //               <ClubFilters
  //                 search={search}
  //                 setSearch={setSearch}
  //                 selectedCategory={selectedCategory}
  //                 setSelectedCategory={setSelectedCategory}
  //                 categoryOptions={categoryOptions}
  //               />

  //               {/* Club List */}
  //               <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-hide">
  //                 {filteredClubs.map((club) => (
  //                   <ClubListCard
  //                     key={club.id}
  //                     club={club}
  //                     isSelected={selectedClub.id === club.id}
  //                     onClick={() => handleClubSelect(club)}
  //                   />
  //                 ))}
  //                 {filteredClubs.length === 0 && (
  //                   <div className="p-4 text-sm text-white/60">
  //                     No clubs match your search / filter.
  //                   </div>
  //                 )}
  //               </div>
  //             </motion.div>
  //           ) : (
  //             <motion.div
  //               key="details"
  //               initial={{ opacity: 0, x: 20 }}
  //               animate={{ opacity: 1, x: 0 }}
  //               exit={{ opacity: 0, x: 20 }}
  //               className="h-full bg-black overflow-hidden"
  //             >
  //               <div className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-hide">
  //                 <ClubDetailPanel
  //                   club={selectedClub}
  //                   onBack={handleBackToList}
  //                 />
  //               </div>
  //             </motion.div>
  //           )}
  //         </AnimatePresence>
  //       </div>

  //       {/* Desktop: Side by side layout */}
  //       <div className="hidden lg:flex flex-1 overflow-hidden">
  //         {/* Left Panel - Club List */}
  //         <div className="w-80 xl:w-96 border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex flex-col">
  //           {/* Header */}
  //           <ClubsHeader clubCount={clubsData.length} />

  //           {/* Search and Category Filter */}
  //           <ClubFilters
  //             search={search}
  //             setSearch={setSearch}
  //             selectedCategory={selectedCategory}
  //             setSelectedCategory={setSelectedCategory}
  //             categoryOptions={categoryOptions}
  //           />

  //           {/* Club List */}
  //           <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
  //             {filteredClubs.map((club) => (
  //               <ClubListCard
  //                 key={club.id}
  //                 club={club}
  //                 isSelected={selectedClub.id === club.id}
  //                 onClick={() => setSelectedClub(club)}
  //               />
  //             ))}
  //             {filteredClubs.length === 0 && (
  //               <div className="p-4 text-sm text-white/60">
  //                 No clubs match your search / filter.
  //               </div>
  //             )}
  //           </div>
  //         </div>

  //         {/* Right Panel - Club Details */}
  //         <div className="flex-1 bg-black overflow-hidden">
  //           <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
  //             <AnimatePresence mode="wait">
  //               <ClubDetailPanel club={selectedClub} />
  //             </AnimatePresence>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
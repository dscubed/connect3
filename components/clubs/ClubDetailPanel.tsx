import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Club } from "@/types/clubs/club";
import { ProfilePageContent } from "@/app/profile/ProfilePageContent";

export function ClubDetailPanel({
  club,
  onBack,
}: {
  club: Club;
  onBack?: () => void;
}) {
  return (
    <motion.div
      key={club.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="relative h-full overflow-y-auto scrollbar-hide"
    >
      {/* Mobile Back Button - sits inside gradient with p-4 from edge */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden absolute top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white text-foreground transition-colors hover:bg-white/90"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* ProfilePageContent handles fetching with race condition protection */}
      <ProfilePageContent
        editingProfile={false}
        setEditingProfile={() => {}}
        profileId={club.id}
      />
    </motion.div>
  );
}

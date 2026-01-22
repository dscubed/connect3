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
      className="h-full overflow-y-auto scrollbar-hide"
    >
      {/* Mobile Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden top-16 flex items-center gap-2 text-muted mb-4 p-2 -ml-2 rounded-lg transition-colors absolute z-50 backdrop-blur-sm border border-muted/50 bg-background/50"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
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

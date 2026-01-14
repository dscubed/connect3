import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronLeft, Loader2 } from "lucide-react";
import { Club } from "@/types/clubs/club";
import { ProfilePageContent } from "@/app/profile/ProfilePageContent";
import { Profile, useAuthStore } from "@/stores/authStore";

export function ClubDetailPanel({
  club,
  onBack,
}: {
  club: Club;
  onBack?: () => void;
}) {
  const { getSupabaseClient } = useAuthStore();
  const supabase = getSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("Fetching profile for id:", club.id);
      if (!club.id) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", club.id)
        .single();
      if (!error) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, club.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader2 className="animate-spin w-8 h-8" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found.</p>
      </div>
    );
  }

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
          className="lg:hidden mt-12 flex items-center gap-2 text-white/60 hover:text-white mb-4 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back to clubs</span>
        </button>
      )}

      <ProfilePageContent
        editingProfile={false}
        setEditingProfile={() => {}}
        profile={profile}
      />
    </motion.div>
  );
}

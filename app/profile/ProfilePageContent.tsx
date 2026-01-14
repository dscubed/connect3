import { motion } from "framer-motion";
import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import ChunksSection from "@/components/profile/ChunksSection";
import EventsSection from "@/components/profile/events/EventsSection";
import { ChunkProvider } from "@/components/profile/chunks/hooks/ChunkProvider";
import { LinksSection } from "@/components/profile/LinksSection";
import { ActionsButton } from "@/components/profile/ActionsButton";
import { Profile } from "@/stores/authStore";
import { useEffect } from "react";
import { SummaryCard } from "@/components/profile/SummaryCard";

interface ProfilePageContentProps {
  editingProfile: boolean;
  setEditingProfile: (editing: boolean) => void;
  profile: Profile;
}

export function ProfilePageContent({
  editingProfile,
  setEditingProfile,
  profile,
}: ProfilePageContentProps) {
  useEffect(() => {
    console.log("Rendering ProfilePageContent for profile:", profile);
  }, [profile]);

  return (
    <div
      className="h-screen w-full max-w-[100vw] overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.3) transparent",
      }}
    >
      <CoverImage editingProfile={editingProfile} />

      <ChunkProvider isEditing={editingProfile} profileId={profile.id}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="relative -mt-20 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between">
                <ProfilePicture
                  avatar={profile.avatar_url ?? null}
                  editingProfile={editingProfile}
                />
                <ActionsButton
                  profile={profile}
                  setEditingProfile={setEditingProfile}
                  editingProfile={editingProfile}
                />
              </div>
              <div className="flex flex-row justify-between">
                <UserDetails
                  profile={profile}
                  editingProfile={editingProfile}
                />
                <LinksSection
                  editingProfile={editingProfile}
                  profile={profile}
                />
              </div>
            </div>
          </motion.div>
          <SummaryCard editingProfile={editingProfile} profile={profile} />

          {/* Events form for organisations only */}
          {profile.account_type === "organisation" && <EventsSection />}

          {/* Chunks Section */}
          <ChunksSection editingProfile={editingProfile} />
        </div>
      </ChunkProvider>
    </div>
  );
}

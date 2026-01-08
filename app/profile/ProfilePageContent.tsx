import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import ChunksSection from "@/components/profile/ChunksSection";
import EventsSection from "@/components/profile/events/EventsSection";
import { ChunkProvider } from "@/components/profile/chunks/hooks/ChunkProvider";
import { LinksSection } from "@/components/profile/LinksSection";
import { ActionsButton } from "@/components/profile/ActionsButton";
import { Profile } from "@/stores/authStore";
import { useEffect, useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("Rendering ProfilePageContent for profile:", profile);
  }, [profile]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 pt-16 md:pt-0 relative">
          <div
            className="h-screen w-full max-w-[100vw] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <CoverImage editingProfile={editingProfile} />

            <ChunkProvider profile={profile}>
              <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
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
                <SummaryCard editingProfile={editingProfile} />

                {/* Events form for organisations only */}
                {profile.account_type === "organisation" && <EventsSection />}

                {/* Chunks Section */}
                <ChunksSection editingProfile={editingProfile} />
              </div>
            </ChunkProvider>
          </div>
        </main>
      </div>
    </div>
  );
}

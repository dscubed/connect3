"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { Profile, useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import TLDRSection from "@/components/profile/TLDRSection";
import ChunksSection from "@/components/profile/ChunksSection";
import EventsSection from "@/components/profile/events/EventsSection";
import { ChunkProvider } from "@/components/profile/chunks/hooks/ChunkProvider";
import { LinksSection } from "@/components/profile/LinksSection";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <CubeLoader size={32} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
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
    <div className="min-h-screen relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 pt-16 md:pt-0 relative">
          <div
            className="h-screen overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <CoverImage />

            <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
              <motion.div
                className="relative -mt-20 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-row justify-between">
                    <ProfilePicture avatar={profile.avatar_url ?? null} />
                    <ActionsButton profile={profile} />
                  </div>
                  <div className="flex flex-row justify-between">
                    <UserDetails profile={profile} />
                    <LinksSection />
                  </div>
                </div>
              </motion.div>
              {/* Events form for organisations only */}
              {profile.account_type === "organisation" && <EventsSection />}

              {/* Chunks Section */}
              <ChunkProvider>
                <ChunksSection />
              </ChunkProvider>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActionsButton({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="text-lg bg-secondary-foreground font-medium text-secondary hover:scale-105 hover:bg-secondary-foreground hover:text-secondary transition-all rounded-2xl"
      >
        Edit Profile
      </Button>
    </div>
  );
}

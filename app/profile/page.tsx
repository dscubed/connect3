"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import TLDRSection from "@/components/profile/TLDRSection";
import ChunksSection from "@/components/profile/chunks/ChunksSection";
import EventsSection from "@/components/profile/events/EventsSection";
import { ChunkProvider } from "@/components/profile/chunks/hooks/ChunkProvider";

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
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <ProfilePicture avatar={profile.avatar_url ?? null} />

                  <UserDetails profile={profile} />

                  <div className="flex gap-3 md:pb-4">
                    {/* Future action buttons can be added here */}
                  </div>
                </div>
              </motion.div>

              {/* TLDR Section */}
              <TLDRSection tldr={profile.tldr || null} />

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

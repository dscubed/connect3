"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import TLDRSection from "@/components/profile/TLDRSection";
import ChunksSection from "@/components/profile/chunks/ChunksSection";
import ProfileModals from "@/components/profile/edit-modals/ProfileModals";
import { useProfileModals } from "@/components/profile/hooks/useProfileModals";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading, initialize } = useAuthStore();
  const { modals, openModal, closeModal, save, editing, setEditing } =
    useProfileModals(profile);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C] text-white">
        <div className="flex items-center gap-4">
          <CubeLoader size={32} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C] text-white">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C] text-white">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
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
            <CoverImage coverImageUrl={profile.cover_image_url ?? null} />

            <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
              <motion.div
                className="relative -mt-20 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <ProfilePicture avatar={profile.avatar_url ?? null} />

                  <UserDetails
                    firstName={profile.first_name || "Unnamed"}
                    lastName={profile.last_name || "Unnamed"}
                    status={profile.status || "Add your current status"}
                    location={profile.location || "Location not set"}
                    onNameClick={openModal.name}
                    onStatusClick={openModal.status}
                    onLocationClick={openModal.location}
                  />

                  <div className="flex gap-3 md:pb-4">
                    <motion.button
                      className="px-6 py-2 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Share Profile
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* TLDR Section */}
              <TLDRSection
                tldr={profile.tldr || null}
                onEdit={openModal.tldr}
              />

              {/* Chunks Section */}
              <ChunksSection userId={user.id} />

              {/* Experience Section */}
              <motion.div
                className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold mb-6">Experience</h2>
                <div className="text-white/60 text-center py-12">
                  <p>Experience section coming soon...</p>
                </div>
              </motion.div>

              {/* Skills Section */}
              <motion.div
                className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <h2 className="text-2xl font-bold mb-6">Skills</h2>
                <div className="text-white/60 text-center py-12">
                  <p>Skills section coming soon...</p>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* All Edit Modals */}
      <ProfileModals
        profile={profile}
        modals={modals}
        closeModal={closeModal}
        save={save}
        editing={editing}
        setEditing={setEditing}
      />
    </div>
  );
}

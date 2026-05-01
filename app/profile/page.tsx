"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ProfilePageContent } from "./ProfilePageContent";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";
import AuthLoadingSpinner from "@/components/ui/AuthLoadingSpinner";
import Sidebar from "@/components/sidebar/Sidebar";

export default function ProfilePage() {
  const [editingProfile, setEditingProfile] = useState(false);
  const { user, profile, loading, profileLoading } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    if (!profile) return;
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden">
        <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
          <Sidebar />
          <main
            className="flex-1 min-h-0 relative overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <ProfilePageSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (profileLoading && user) {
    return <AuthLoadingSpinner />;
  }

  if (!user || !profile) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar />
        <main
          className="flex-1 min-h-0 relative overflow-y-auto md:ml-[68px]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          <ProfilePageContent
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
            profile={profile}
          />
        </main>
      </div>
    </div>
  );
}

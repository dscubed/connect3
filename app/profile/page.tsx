"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ProfilePageContent } from "./ProfilePageContent";
import Sidebar from "@/components/sidebar/Sidebar";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
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

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 pt-16 md:pt-0 relative">
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

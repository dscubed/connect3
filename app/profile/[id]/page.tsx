"use client";
import { ProfilePageContent } from "../ProfilePageContent";
import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { useAuthStore } from "@/stores/authStore";

export default function ProfilePage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const { user } = useAuthStore();

  // Allow editing only when viewing own profile
  const isOwnProfile = user?.id === id;
  const effectiveEditingProfile = isOwnProfile ? editingProfile : false;
  const effectiveSetEditingProfile = isOwnProfile ? setEditingProfile : () => {};

  if (!id || typeof id !== "string") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p>Invalid profile ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 min-h-0 relative overflow-y-auto">
          {/* ProfilePageContent handles fetching with race condition protection */}
          <ProfilePageContent
            editingProfile={effectiveEditingProfile}
            setEditingProfile={effectiveSetEditingProfile}
            profileId={id}
          />
        </main>
      </div>
    </div>
  );
}

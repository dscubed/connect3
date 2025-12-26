"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ProfilePageContent } from "./ProfilePageContent";

export default function ProfilePage() {
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
    <ProfilePageContent
      editingProfile={editingProfile}
      setEditingProfile={setEditingProfile}
      profile={profile}
    />
  );
}

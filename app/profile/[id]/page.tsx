"use client";
import { ProfilePageContent } from "../ProfilePageContent";
import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";

export default function ProfilePage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Visitors cannot edit profiles
  const EDITING_PROFILE_VISITOR = false;
  const SET_EDITING_PROFILE_VISITOR = () => {};

  if (!id || typeof id !== "string") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p>Invalid profile ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 pt-16 md:pt-0 relative">
          {/* ProfilePageContent handles fetching with race condition protection */}
          <ProfilePageContent
            editingProfile={EDITING_PROFILE_VISITOR}
            setEditingProfile={SET_EDITING_PROFILE_VISITOR}
            profileId={id}
          />
        </main>
      </div>
    </div>
  );
}

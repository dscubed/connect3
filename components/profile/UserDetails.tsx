"use client";
import { useState } from "react";
import { ProfileModal } from "./details/ProfileModal";
import { Profile } from "@/stores/authStore";
import { universities, University } from "./details/univeristies";
import { cn } from "@/lib/utils";

interface UserDetailsProps {
  profile: Profile;
  editingProfile: boolean;
}

export default function UserDetails({
  profile,
  editingProfile,
}: UserDetailsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      className="flex-1 md:pb-4"
      onClick={() => {
        if (editingProfile) {
          setModalOpen(true);
        }
      }}
    >
      {/* Name */}
      <div className="flex flex-col gap-2 mb-2">
        <h1
          className={cn(
            "text-4xl font-medium",
            editingProfile && "hover:scale-105 transition-all cursor-pointer"
          )}
        >
          {profile.first_name} {profile.last_name || ""}
        </h1>
        {/* University */}
        <h1
          className={cn(
            "text-xl font-normal text-muted/80 flex items-center gap-2",
            editingProfile && "hover:scale-105 transition-all cursor-pointer "
          )}
        >
          {profile.university && profile.university in universities
            ? universities[profile.university as University].name
            : "-"}
        </h1>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={modalOpen} setIsOpen={setModalOpen} />
    </div>
  );
}

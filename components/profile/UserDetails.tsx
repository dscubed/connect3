"use client";
import { useState, ReactNode } from "react";
import { ProfileModal } from "./details/ProfileModal";
import { Profile } from "@/stores/authStore";
import { universities, University } from "./details/univeristies";
import { cn } from "@/lib/utils";

interface UserDetailsProps {
  profile: Profile;
  editingProfile: boolean;
  /** Renders on the same line as university (e.g. social links for clubs) */
  universitySuffix?: ReactNode;
}

export default function UserDetails({
  profile,
  editingProfile,
  universitySuffix,
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
            "text-2xl font-medium",
            editingProfile && "hover:scale-105 transition-all cursor-pointer"
          )}
        >
          {profile.first_name} {profile.last_name || ""}
        </h1>
        {/* University row - with optional suffix (e.g. social links) on the same line */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 min-h-10">
          <h1
            className={cn(
              "text-lg font-normal text-muted/80 flex items-center gap-2",
              editingProfile && "hover:scale-105 transition-all cursor-pointer "
            )}
          >
            {profile.university && profile.university in universities
              ? universities[profile.university as University].name
              : "No university set"}
          </h1>
          {universitySuffix}
        </div>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={modalOpen} setIsOpen={setModalOpen} />
    </div>
  );
}

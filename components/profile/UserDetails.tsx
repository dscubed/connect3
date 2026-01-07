"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { ProfileModal } from "./details/ProfileModal";
import { Profile } from "@/stores/authStore";
import { universities, University } from "./details/univeristies";

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
        <motion.h1
          className="text-4xl font-bold cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {profile.first_name} {profile.last_name || ""}
        </motion.h1>

        <motion.h1
          className="text-2xl font-medium text-muted/80 cursor-pointer flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {profile.university && profile.university in universities
            ? universities[profile.university as University].name
            : "-"}
        </motion.h1>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={modalOpen} setIsOpen={setModalOpen} />
    </div>
  );
}

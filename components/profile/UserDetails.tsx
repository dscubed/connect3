"use client";
import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";
import { useProfileModals } from "@/components/profile/hooks/useProfileModals";
import ProfileModals from "@/components/profile/edit-modals/ProfileModals";

interface Profile {
  first_name?: string;
  last_name?: string;
  status?: string;
  location?: string;
  tldr?: string;
}

interface UserDetailsProps {
  profile: Profile;
}

export default function UserDetails({ profile }: UserDetailsProps) {
  const {
    handleOpen,
    handleClose,
    handleSave,
    editing,
    setField,
    openModal: modal,
  } = useProfileModals(profile);

  return (
    <div className="flex-1 md:pb-4">
      {/* Name */}
      <div className="flex items-center gap-2 mb-2">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-white cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpen("name")}
        >
          {profile.first_name} {profile.last_name || ""}
        </motion.h1>
      </div>

      {/* Status */}
      <motion.div
        className="flex items-center gap-2 text-white/80 mb-3 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOpen("status")}
      >
        <Briefcase className="h-4 w-4" />
        <span className="text-lg">
          {profile.status || "Add your current status"}
        </span>
      </motion.div>

      {/* Location */}
      <motion.div
        className="flex items-center gap-2 text-white/60 mb-4 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOpen("location")}
      >
        <MapPin className="h-4 w-4" />
        <span>{profile.location || "Location not set"}</span>
      </motion.div>

      {/* Modals */}
      <ProfileModals
        modal={modal}
        editing={editing}
        setField={setField}
        handleClose={handleClose}
        handleSave={handleSave}
      />
    </div>
  );
}

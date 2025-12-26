"use client";
import { motion } from "framer-motion";
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
      <div className="flex flex-col gap-2 mb-2">
        <motion.h1
          className="text-4xl font-bold cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpen("name")}
        >
          {profile.first_name} {profile.last_name || ""}
        </motion.h1>
        <motion.h1
          className="text-2xl font-medium text-muted/80 cursor-pointer flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          University of Melbourne
        </motion.h1>
      </div>

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

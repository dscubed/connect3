import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Box } from "lucide-react";
import { useEffect } from "react";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
  tldr: string | null;
  status: string | null;
};

const ProfileCard = ({
  profile,
  onExpandChange,
}: {
  profile: Profile;
  onExpandChange?: (expanded: boolean) => void;
}) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (onExpandChange) onExpandChange(hovered);
    // Only notify when hovered changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  // Helper functions
  const getFullName = () => {
    return profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name;
  };

  const getDisplayTldr = () => {
    return profile.tldr &&
      profile.tldr !== "Welcome to Connect3! Tell us about yourself..."
      ? profile.tldr
      : "New to Connect3 - getting started!";
  };

  const getDisplayStatus = () => {
    return profile.status || "a Connect3 user!";
  };

  return (
    <motion.div
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md overflow-hidden group transition-all duration-300 touch-manipulation"
    >
      <div className="flex items-start gap-3">
        <Image
          src={profile.avatar_url || "/placeholder.svg"}
          alt={getFullName()}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
          priority
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold leading-tight truncate">
              {getFullName()}
            </h3>
            <Box className="h-3.5 w-3.5 text-white/60" />
          </div>
          <p className="text-white/60 text-sm truncate">{getDisplayStatus()}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-white/50" />
            <span className="text-white/50 text-xs truncate">
              {profile.location || "Location not set"}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: hovered ? 1 : 0,
          height: hovered ? "auto" : 0,
          marginTop: hovered ? 12 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="text-white/90 text-sm leading-relaxed">
          {getDisplayTldr()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none rounded-2xl border border-white/20"
        style={{ boxShadow: "0 0 60px 4px rgba(255,255,255,0.08) inset" }}
      />
    </motion.div>
  );
};

export default ProfileCard;

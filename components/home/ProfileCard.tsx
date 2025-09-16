// ...existing code...
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Box } from "lucide-react";

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
  expanded,
  onExpandChange,
}: {
  profile: Profile;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}) => {
  // local state when uncontrolled
  const [localExpanded, setLocalExpanded] = useState(false);
  const isControlled = typeof expanded !== "undefined";
  const isExpanded = isControlled ? expanded : localExpanded;

  const setExpanded = (val: boolean) => {
    if (isControlled) {
      onExpandChange?.(val);
    } else {
      setLocalExpanded(val);
      onExpandChange?.(val);
    }
  };

  const toggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded(!isExpanded);
  };

  // helpers
  const getFullName = () =>
    profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name;

  const getDisplayTldr = () =>
    profile.tldr &&
    profile.tldr !== "Welcome to Connect3! Tell us about yourself..."
      ? profile.tldr
      : "New to Connect3 - getting started!";

  const getDisplayStatus = () => profile.status || "a Connect3 user!";

  return (
    <motion.div
      layout
      onClick={toggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleExpand();
        }
      }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
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
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? "auto" : 0,
          marginTop: isExpanded ? 12 : 0,
        }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
          {getDisplayTldr()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none rounded-2xl border border-white/20"
        style={{ boxShadow: "0 0 60px 4px rgba(255,255,255,0.08) inset" }}
      />
    </motion.div>
  );
};

export default ProfileCard;
// ...existing code...

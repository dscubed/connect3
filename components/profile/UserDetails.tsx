"use client";
import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";

interface UserDetailsProps {
  firstName: string;
  lastName?: string;
  status?: string;
  location?: string;
  onNameClick: () => void;
  onStatusClick: () => void;
  onLocationClick: () => void;
}

export default function UserDetails({
  firstName,
  lastName,
  status,
  location,
  onNameClick,
  onStatusClick,
  onLocationClick,
}: UserDetailsProps) {
  return (
    <div className="flex-1 md:pb-4">
      {/* Name */}
      <div className="flex items-center gap-2 mb-2">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-white cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNameClick}
        >
          {firstName} {lastName || ""}
        </motion.h1>
      </div>

      {/* Status */}
      <motion.div
        className="flex items-center gap-2 text-white/80 mb-3 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStatusClick}
      >
        <Briefcase className="h-4 w-4" />
        <span className="text-lg">{status || "Add your current status"}</span>
      </motion.div>

      {/* Location */}
      <motion.div
        className="flex items-center gap-2 text-white/60 mb-4 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onLocationClick}
      >
        <MapPin className="h-4 w-4" />
        <span>{location || "Location not set"}</span>
      </motion.div>
    </div>
  );
}

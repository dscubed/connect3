import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Box } from "lucide-react";

export type Person = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  tags: string[];
  blurb: string;
};

const ProfileCard = ({ person }: { person: Person }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md overflow-hidden group transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <Image
          src={person.avatar || "/placeholder.svg"}
          alt={person.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
          priority
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold leading-tight truncate">
              {person.name}
            </h3>
            <Box className="h-3.5 w-3.5 text-white/60" />
          </div>
          <p className="text-white/60 text-sm truncate">{person.role}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {person.tags.map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/10 hover:bg-white/15 transition-colors"
          >
            {t}
          </span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, height: 3 }}
        animate={{ opacity: hovered ? 1 : 0.6, height: hovered ? "auto" : 0 }}
        className="text-white text-sm mt-3"
      >
        {person.blurb}
      </motion.p>

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

import { motion } from "framer-motion";
import { useState } from "react";
import { MappedMatchDetails } from "../types";
import { demoUsers } from "../sample-data/DemoUsers";

export default function DemoProfileCard({
  match,
  index,
}: {
  match: MappedMatchDetails;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const user = demoUsers[match.user_id as keyof typeof demoUsers];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md cursor-pointer overflow-hidden group"
    >
      <motion.div
        animate={{ scale: hovered ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-white/10"
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {match.full_name.charAt(0)}
          </motion.div>

          <div className="flex-1">
            <motion.h3
              className="text-white font-semibold"
              animate={{ x: hovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {match.full_name}
            </motion.h3>
            <motion.p
              className="text-white/60 text-xs"
              animate={{ opacity: hovered ? 1 : 0.7 }}
              transition={{ duration: 0.2 }}
            >
              📍 {user.location || "Unknown"}
            </motion.p>
          </div>
        </div>
        <div className="space-y-1">
          <motion.p
            className="text-white/90 text-sm font-medium"
            animate={{ opacity: hovered ? 1 : 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {user.status || "No status set"}
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none rounded-2xl border border-white/20"
        style={{ boxShadow: "0 0 60px 4px rgba(255,255,255,0.08) inset" }}
      />
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useState } from "react";

export interface ProfileCardProps {
  person: {
    id: string;
    name: string;
    description: string;
    avatar: string;
  };
  index: number;
  onClick: () => void;
}

export const ProfileCard = ({ person, index, onClick }: ProfileCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="relative bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md cursor-pointer overflow-hidden group"
    >
      <motion.div animate={{ scale: hovered ? 1.02 : 1 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-3 mb-3">
          <motion.img
            src={person.avatar || "/placeholder.svg"}
            alt={person.name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.h3
            className="text-white font-semibold"
            animate={{ x: hovered ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {person.name}
          </motion.h3>
        </div>
        <motion.p
          className="text-white/80 text-sm"
          animate={{ opacity: hovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {person.description}
        </motion.p>
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

import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

export default function CoverImage() {
  return (
    <motion.div
      className="relative h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />

      {/* Additional edge blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/50" />

      {/* Edit Cover Button */}
      <motion.button
        className="absolute top-4 right-4 p-2 rounded-xl bg-background/30 border border-white/20 hover:bg-background/40 transition-all backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Edit3 className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

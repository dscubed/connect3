"use client";
import { motion } from "framer-motion";
import { Share } from "lucide-react";

interface ShareButtonProps {
  chatroomId: string | null;
}

export default function ShareButton({ chatroomId }: ShareButtonProps) {
  const handleShare = () => {
    if (chatroomId) {
      const url = `${window.location.origin}/search?chatroom=${chatroomId}`;
      navigator.clipboard.writeText(url);
      // You could add a toast notification here
      console.log("🔗 Copied share URL to clipboard:", url);
    }
  };

  return (
    <motion.div
      className="flex justify-end p-4 flex-shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 border border-white/10 hover:bg-black/40 transition-all"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 20px rgba(255,255,255,0.1)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        disabled={!chatroomId}
      >
        <Share className="h-4 w-4" />
        <span className="text-sm">share search</span>
      </motion.button>
    </motion.div>
  );
}

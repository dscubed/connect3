import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { ChunkData } from "@/components/profile/chunks/ChunkUtils";
import { ChunksList } from "./ChunksList";
import { useEffect } from "react";

export interface UserProfileProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    status?: string;
    location?: string;
    tldr?: string;
    chunks?: ChunkData[];
    chunkLoading?: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ user, isOpen, onClose }: UserProfileProps) => {
  // On escape key press, close the profile
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4/5 md:w-[512px] bg-[#0B0B0C]/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors">
                    message
                  </button>
                  <button className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
                    share
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover ring-2 ring-white/10"
                    sizes="80px"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.name}
                </h2>

                <p className="text-white/60">
                  📍{user.location ? user.location : "-"}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {user.status ? user.status : "No status available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">tldr</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {user.tldr}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  {/* Chunks List */}
                  <ChunksList
                    chunks={user.chunks || []}
                    chunksLoading={user.chunkLoading || false}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

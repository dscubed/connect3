import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface UserProfileProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    tldr: string;
    today: string[];
    pastVentures: string[];
    viralSuccess: string[];
    lookingFor: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ user, isOpen, onClose }: UserProfileProps) => {
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
            className="fixed right-0 top-0 h-full w-96 bg-[#0B0B0C]/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors">
                    message
                  </button>
                  <button className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
                    share
                  </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="h-20 w-20 rounded-full mx-auto mb-4 ring-2 ring-white/10"
                />
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-white/60">{user.location}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">tldr</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{user.tldr}</p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">today</h3>
                  <ul className="space-y-2">
                    {user.today.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">past ventures</h3>
                  <ul className="space-y-2">
                    {user.pastVentures.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">viral success</h3>
                  <ul className="space-y-2">
                    {user.viralSuccess.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">looking for collaborators</h3>
                  <ul className="space-y-2">
                    {user.lookingFor.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

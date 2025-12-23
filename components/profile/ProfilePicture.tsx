import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Edit3 } from "lucide-react";
import EditAvatarModal from "./edit-modals/EditAvatarModal";

interface ProfilePictureProps {
  avatar: string | null;
  editingProfile: boolean;
}

export default function ProfilePicture({
  avatar,
  editingProfile,
}: ProfilePictureProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative w-fit">
      <motion.div
        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#0B0B0C] bg-[#0B0B0C]"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {avatar && (
          <Image
            src={avatar}
            alt={`User Avatar`}
            fill
            className="object-cover"
            priority
          />
        )}
      </motion.div>
      {/* Edit Avatar Button */}
      {editingProfile && (
        <motion.button
          className="absolute bottom-2 right-2 p-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-lg animate-fade-in"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
        >
          <Edit3 className="h-3 w-3" />
        </motion.button>
      )}

      <EditAvatarModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

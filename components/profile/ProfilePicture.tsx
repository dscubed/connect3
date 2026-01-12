import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Edit3 } from "lucide-react";
import EditAvatarModal from "./edit-modals/EditAvatarModal";
import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4",
          "border-secondary bg-secondary-foreground",
          editingProfile && "hover:scale-105 transition-all"
        )}
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
      </div>
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

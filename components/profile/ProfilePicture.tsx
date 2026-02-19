import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Avvvatars from "avvvatars-react";
import { Edit3, Upload, RotateCcw } from "lucide-react";
import EditAvatarModal from "./edit-modals/EditAvatarModal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { deleteAvatar } from "@/lib/supabase/storage";
import { toast } from "sonner";

interface ProfilePictureProps {
  avatar: string | null;
  userId: string;
  fullName?: string;
  editingProfile: boolean;
  /** When true, shows rounded square (like Twitter orgs); otherwise circular. */
  isOrganisation?: boolean;
}

export default function ProfilePicture({
  avatar,
  userId,
  fullName = "User",
  editingProfile,
  isOrganisation = false,
}: ProfilePictureProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { profile, updateProfile, getSupabaseClient } = useAuthStore();

  const showGeneratedAvatar = !avatar || imageError;

  const handleReset = async () => {
    if (!profile?.id) return;

    try {
      const supabase = getSupabaseClient();
      await deleteAvatar(profile.id, supabase);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);

      if (error) throw error;

      updateProfile({ avatar_url: "" });
      toast.success("Avatar has been reset");
    } catch (error) {
      console.error("Error resetting avatar:", error);
      toast.error("Failed to reset avatar");
    }
  };

  return (
    <div className="relative w-fit">
      <div
        className={cn(
          "relative w-32 h-32 md:w-40 md:h-40 overflow-hidden border-4",
          "border-secondary bg-white",
          isOrganisation ? "rounded-[10%]" : "rounded-full",
          editingProfile && "hover:scale-105 transition-all"
        )}
      >
        {avatar && !showGeneratedAvatar ? (
          <Image
            src={avatar}
            alt={`User Avatar`}
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Avvvatars
              value={userId || "anonymous"}
              displayValue={fullName}
              size={160}
              radius={isOrganisation ? 16 : 160}
              border={false}
            />
          </div>
        )}
      </div>
      {/* Edit Avatar Dropdown */}
      {editingProfile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="absolute bottom-2 right-2 p-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit3 className="h-3 w-3" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={4}
            className="w-44 rounded-xl border border-black/10 bg-white shadow-lg p-1"
          >
            <DropdownMenuItem 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Upload</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReset}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-destructive focus:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm font-medium">Reset</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <EditAvatarModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}


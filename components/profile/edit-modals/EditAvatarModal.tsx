"use client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { updateAvatar } from "@/lib/supabase/storage";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function EditAvatarModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, updateProfile, getSupabaseClient } = useAuthStore();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 5MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    if (selectedFile) {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    if (profile && profile.id) {
      const result = await updateAvatar(
        profile.id,
        selectedFile,
        getSupabaseClient()
      );
      if (!result || result.success === false) {
        toast.error(`
          "Failed to update avatar:",
          ${result?.error || "Unknown error"}
        `);
        return;
      }
      updateProfile({
        avatar_url: result.url,
        blurred_avatar_url: result.blurredUrl,
      });
      toast.success("Avatar updated successfully!");
    }
    setIsUploading(false);
    onOpenChange(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  // Always show image: preview if selected, else profile avatar, else default
  const avatarSrc = previewUrl || profile?.avatar_url || "/default-avatar.png";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Upload New Avatar</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            className="cursor-pointer group relative w-32 h-32"
            onClick={handleImageClick}
            title={
              selectedFile
                ? "Click to remove selected image"
                : "Click to upload new image"
            }
          >
            <Image
              src={avatarSrc}
              alt="Avatar Preview"
              width={128}
              height={128}
              className="rounded-full w-32 h-32 object-cover border border-white/10 group-hover:opacity-80 transition"
            />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {selectedFile ? (
                <X className="h-8 w-8 text-white bg-black/30 rounded-full p-1" />
              ) : (
                <Upload className="h-8 w-8 text-white bg-black/30 rounded-full p-1" />
              )}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="px-4 py-2 font-medium flex items-center justify-center transition-all duration-150"
            variant="default"
            onClick={handleConfirm}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
          <Button
            className="px-4 py-2 font-medium"
            variant="secondary"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

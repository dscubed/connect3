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
import { Loader2, Upload } from "lucide-react";
import { updateAvatar } from "@/lib/supabase/storage";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import ImageCropper from "@/components/ui/ImageCropper";

export default function EditAvatarModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
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
      setOriginalFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCroppedFile(null); // Reset cropped file when new image is selected
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setCroppedFile(croppedFile);
  };

  const handleConfirm = async () => {
    if (!croppedFile) {
      toast.error("Please wait for the image to be cropped");
      return;
    }
    
    setIsUploading(true);
    if (profile && profile.id) {
      const result = await updateAvatar(
        profile.id,
        croppedFile,
        getSupabaseClient()
      );
      if (!result || result.success === false) {
        toast.error(
          `Failed to update avatar: ${result?.error || "Unknown error"}`
        );
        setIsUploading(false);
        return;
      }
      updateProfile({
        avatar_url: result.url,
      });
      toast.success("Avatar updated successfully!");
    }
    setIsUploading(false);
    onOpenChange(false);
    // Reset state
    setOriginalFile(null);
    setPreviewUrl(null);
    setCroppedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    setOriginalFile(null);
    setPreviewUrl(null);
    setCroppedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  const handleSelectNewImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true} className="max-w-md border-none rounded-2xl">
        <DialogHeader>
          <DialogTitle>Upload New Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!previewUrl ? (
            // Upload prompt when no image selected
            <div
              className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
              onClick={handleSelectNewImage}
            >
              <div className="p-4 rounded-full bg-slate-100">
                <Upload className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Click to upload image
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>
          ) : (
            // Image cropper when image is selected
            <div className="space-y-3">
              <div className="w-full aspect-square max-w-md">
                <ImageCropper
                  imageSrc={previewUrl}
                  onCropComplete={handleCropComplete}
                  aspectRatio={1}
                  shape="round"
                  fileName={originalFile?.name || "avatar.png"}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleSelectNewImage}
                className="w-full shadow-none"
                disabled={isUploading}
              >
                Select Different Image
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="ghost"
            className="rounded-full bg-gray-200 px-4 py-1.5 text-muted hover:bg-gray-300 hover:text-card-foreground"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="rounded-full bg-purple-500 px-4 py-1.5 text-white hover:bg-purple-600 hover:text-white flex items-center justify-center"
            onClick={handleConfirm}
            disabled={isUploading || !croppedFile}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

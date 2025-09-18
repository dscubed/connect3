import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface Chunk {
  chunk_id: string;
  category: string;
  content: string;
}

export const useOnboarding = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { updateProfile } = useAuthStore.getState();

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isAIChunked, setIsAIChunked] = useState(false); // New state for AI chunking

  // Redirect if onboarding already completed
  useEffect(() => {
    if (profile?.onboarding_completed === true) {
      router.push("/");
      toast.error("Onboarding already completed!");
    }
  }, [profile, router]);

  // Set existing avatar
  useEffect(() => {
    if (profile?.avatar_url) {
      setProfileImage(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const handleFileUpload = (file: File) => {
    if (uploadedFiles.length < 2) {
      setUploadedFiles((prev) => [...prev, file]);
    }
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);
    setSelectedFile(file);
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setSelectedFile(null);
    if (profileImage && profileImage.startsWith("blob:")) {
      URL.revokeObjectURL(profileImage);
    }
  };
  // Finalize onboarding and upload chunks
  const completeOnboarding = async () => {
    try {
      let avatarUrl: string | undefined = undefined;

      if (selectedFile && user?.id) {
        const { uploadAvatar } = await import("@/lib/supabase/storage");
        const result = await uploadAvatar(selectedFile, user.id);

        if (result.success) {
          avatarUrl = result.url;
          if (profileImage && profileImage.startsWith("blob:")) {
            URL.revokeObjectURL(profileImage);
          }
        } else {
          toast.error(result.error || "Failed to upload profile picture");
          return;
        }
      }

      await updateProfile({
        onboarding_completed: true,
        avatar_url: avatarUrl,
      });

      if (chunks.length > 0) {
        useAuthStore
          .getState()
          .makeAuthenticatedRequest("/api/onboarding/upload", {
            method: "POST",
            body: JSON.stringify({
              chunks,
              userId: user?.id,
            }),
          })
          .catch(console.error);
      }

      toast.success("Welcome to connect³! Onboarding completed successfully");
      router.push("/");
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast.error("Failed to complete onboarding");
    }
  };

  return {
    // State
    currentStep,
    setCurrentStep,
    uploadedFiles,
    profileImage,
    selectedFile,
    chunks,
    setChunks,
    isAIChunked,
    setIsAIChunked,
    user,
    profile,
    updateProfile,

    // Handlers
    handleFileUpload,
    handleFileRemove,
    handleImageUpload,
    handleImageRemove,
    completeOnboarding,
  };
};

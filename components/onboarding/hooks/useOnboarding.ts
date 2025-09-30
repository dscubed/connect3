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
  };
};

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export const useOnboarding = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { updateProfile } = useAuthStore.getState();

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [descriptionWordCount, setDescriptionWordCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunkedData, setChunkedData] = useState<{
    chunks: Array<{ chunk_index: number; content: string }>;
    userId: string;
  } | null>(null);

  // Initialize word count when description changes
  useEffect(() => {
    if (description && description.trim()) {
      const count = description
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      setDescriptionWordCount(count);
    } else {
      setDescriptionWordCount(0);
    }
  }, [description]);

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
    description,
    setDescription,
    descriptionWordCount,
    profileImage,
    selectedFile,
    chunkedData,
    setChunkedData,
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

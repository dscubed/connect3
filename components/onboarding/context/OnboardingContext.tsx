"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { processFiles } from "@/lib/onboarding/documentProcessor";
import { uploadAvatar } from "@/lib/supabase/storage";

import { Chunk } from "../chunks/utils/ChunkUtils";
import {
  useProcessingStore,
  processingActions,
} from "@/stores/processingStore";

interface OnboardingContextValue {
  // Step 1: File Upload
  handleFileUpload: (file: File) => void;
  handleFileRemove: (index: number) => void;
  uploadedFiles: File[];

  // Step 2: Chunks
  chunks: Chunk[];
  setChunks: (chunks: Chunk[]) => void;
  isAIChunked: boolean;
  setIsAIChunked: (value: boolean) => void;

  // Step 3: Profile Picture
  profileImage: string | null;
  selectedFile: File | null;
  handleImageUpload: (file: File) => void;
  handleImageRemove: () => void;

  // Step Logic
  currentStep: number;
  setCurrentStep: (step: number) => void;
  showBackWarning: boolean;
  setShowBackWarning: (value: boolean) => void;
  canContinue: () => boolean;
  nextStep: () => Promise<void>;
  canSkip: () => boolean;
  skipStep: () => void;
  prevStep: () => void;
  handleConfirmBack: () => void;
  onboardingCompleted: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

// Provider component
export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // HOOKS AND STORES
  const router = useRouter();
  const { user, profile, updateProfile, loading } = useAuthStore();
  const { state } = useProcessingStore();

  // STATES
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isAIChunked, setIsAIChunked] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (profile?.onboarding_completed === true && !loading) {
      router.push("/");
      toast.error("Onboarding already completed!");
    }
    if (!user && !loading) {
      router.push("/auth/login");
      toast.error("You must be logged in to access onboarding.");
    }
  }, [profile, router, user, loading]);

  // Set existing avatar
  useEffect(() => {
    if (profile?.avatar_url) {
      setProfileImage(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (uploadedFiles.length < 2) {
      setUploadedFiles((prev) => [...prev, file]);
    }
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);
    setSelectedFile(file);
  };

  // Handle image removal
  const handleImageRemove = () => {
    setProfileImage(null);
    setSelectedFile(null);
    if (profileImage && profileImage.startsWith("blob:")) {
      URL.revokeObjectURL(profileImage);
    }
  };

  // Step Logic
  const canContinue = () => {
    // Prevent continuation during processing
    if (
      state === "parsing" ||
      state === "validating" ||
      state === "chunking" ||
      state === "uploading"
    ) {
      return false;
    }

    // Conditions to move to the next step
    if (currentStep === 0) return uploadedFiles.length > 0;
    else if (currentStep === 1) return chunks.length > 0;
    else if (currentStep === 2) return true;
    else return false;
  };

  // Determine if the user can skip the current step
  const canSkip = () => {
    if (currentStep === 0) return true;
    else if (currentStep === 1) return false;
    else if (currentStep === 2) return true;
    else return true;
  };

  // Determines what happens when moving to the next step
  const nextStep = async () => {
    // Step 1: File Processing (chunking + validation)
    if (currentStep === 0 && uploadedFiles.length > 0) {
      await handleFileProcessing();
    }
    // Step 2: Move to Profile Picture step if >1 chunks
    else if (currentStep === 1 && chunks.length > 0) {
      setCurrentStep(2);
    }
  };

  // Process resume and chunk it
  const handleFileProcessing = async () => {
    try {
      const result = await processFiles(uploadedFiles);

      if (!result.success || !user) return;

      toast.success(
        `Successfully processed ${result.parsedFiles.length} file(s)`
      );
      processingActions.setChunking();

      const resumeText = result.parsedFiles[0]?.text || "";
      const chunkResponse = await useAuthStore
        .getState()
        .makeAuthenticatedRequest("/api/onboarding/chunkText", {
          method: "POST",
          body: JSON.stringify({ text: resumeText }),
        });

      if (!chunkResponse.ok) {
        const error = await chunkResponse.json();
        throw new Error(error.error || "Chunking failed");
      }

      const chunkData = await chunkResponse.json();
      if (!chunkData.success || !Array.isArray(chunkData.chunks)) {
        throw new Error("Chunking failed");
      }

      setChunks(chunkData.chunks);
      setIsAIChunked(true); // <-- Mark as AI chunked
      processingActions.setSuccess();
      setCurrentStep(1);
    } catch (error) {
      console.error("Chunking failed:", error);
      processingActions.setError();
      toast.error("Failed to process your resume. Please try again.");
    }
  };

  // Complete onboarding: upload avatar and chunks
  const onboardingCompleted = async () => {
    try {
      let avatarUrl: string | undefined = undefined;
      let blurredAvatarUrl: string | undefined = undefined;

      // upload selected avatar to supabase storage and get url
      if (selectedFile && user?.id) {
        const result = await uploadAvatar(selectedFile, user.id);

        if (result.success) {
          avatarUrl = result.url;
          if (profileImage && profileImage.startsWith("blob:")) {
            URL.revokeObjectURL(profileImage);
          }
          blurredAvatarUrl = result.blurredUrl;
          if (blurredAvatarUrl && blurredAvatarUrl.startsWith("blob:")) {
            URL.revokeObjectURL(blurredAvatarUrl);
          }
        } else {
          toast.error(result.error || "Failed to upload profile picture");
          return;
        }
      }

      // update profile with avatar urls and mark onboarding as completed
      await updateProfile({
        onboarding_completed: true,
        avatar_url: avatarUrl,
        blurred_avatar_url: blurredAvatarUrl,
      });

      // Upload chunks if available
      if (chunks.length > 0 && user?.id) {
        console.log("Uploading chunks:", chunks);
        const payload = {
          chunks,
          userId: user.id,
        };
        useAuthStore
          .getState()
          .makeAuthenticatedRequest("/api/onboarding/upload", {
            method: "POST",
            body: JSON.stringify(payload),
          })
          .catch(console.error);
      }

      // Notify user of successful onboarding completion
      toast.success("Welcome to connect³! Onboarding completed successfully");
      router.push("/");
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast.error("Failed to complete onboarding");
    }
  };

  // Handles confirming back navigation that resets chunks state
  const handleConfirmBack = () => {
    setChunks([]);
    setCurrentStep(0);
    setShowBackWarning(false);
  };

  // Handles going to the previous step with back warning if needed
  const prevStep = () => {
    if (currentStep === 1 && chunks.length > 0) {
      setShowBackWarning(true);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handles skipping the current step
  const skipStep = () => {
    if (currentStep === 2) {
      onboardingCompleted();
    } else {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === 0) {
      setIsAIChunked(false);
    }
  };

  const value: OnboardingContextValue = {
    // File Upload
    handleFileUpload,
    handleFileRemove,
    uploadedFiles,

    // Chunks
    chunks,
    setChunks,
    isAIChunked,
    setIsAIChunked,

    // Profile Picture
    profileImage,
    selectedFile,
    handleImageUpload,
    handleImageRemove,

    // Step Logic
    currentStep,
    setCurrentStep,
    showBackWarning,
    setShowBackWarning,
    canContinue,
    canSkip,
    nextStep,
    onboardingCompleted,
    skipStep,
    prevStep,
    handleConfirmBack,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Custom hook to use the OnboardingContext
export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error(
      "useOnboardingContext must be used within an OnboardingProvider"
    );
  }
  return context;
}

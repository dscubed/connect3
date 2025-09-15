import { useAuthStore } from "@/stores/authStore";
import {
  processingActions,
  useProcessingStore,
} from "@/stores/processingStore";
import { generateProfileSummary } from "@/lib/generateSummary/generateProfileSummary";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Chunk {
  chunk_index: number;
  content: string;
}

interface ChunkedData {
  chunks: Chunk[];
  userId: string;
}

interface User {
  id: string;
}

interface UseOnboardingStepsParams {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  uploadedFiles: File[];
  description: string;
  setDescription: (desc: string) => void;
  descriptionWordCount: number;
  chunkedData: ChunkedData | null;
  setChunkedData: (data: ChunkedData | null) => void;
  selectedFile: File | null;
  profileImage: string | null;
  user: User | null;
  updateProfile: (data: {
    onboarding_completed: boolean;
    avatar_url?: string;
  }) => Promise<void>;
}

export const useOnboardingSteps = ({
  currentStep,
  setCurrentStep,
  uploadedFiles,
  description,
  setDescription,
  descriptionWordCount,
  chunkedData,
  setChunkedData,
  selectedFile,
  profileImage,
  user,
  updateProfile,
}: UseOnboardingStepsParams) => {
  const router = useRouter();
  const { state } = useProcessingStore();

  const canContinue = () => {
    if (
      state === "parsing" ||
      state === "validating" ||
      state === "summarizing" ||
      state === "uploading"
    ) {
      return false;
    }

    switch (currentStep) {
      case 0:
        return uploadedFiles.length > 0;
      case 1:
        return descriptionWordCount >= 10;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const canSkip = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return false;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (currentStep === 0 && uploadedFiles.length > 0) {
      await handleFileProcessing();
    } else if (currentStep === 1 && descriptionWordCount >= 10) {
      await handleTextChunking();
    }
  };

  const handleFileProcessing = async () => {
    try {
      const { processFiles } = await import("@/lib/documentProcessor");
      const result = await processFiles(uploadedFiles);

      if (!result.success) return;

      toast.success(
        `Successfully processed ${result.parsedFiles.length} file(s)`
      );
      processingActions.setSummarizing();

      const { success, text } = await generateProfileSummary(
        result.parsedFiles
      );

      if (success && text) {
        processingActions.setSuccess();
        setDescription(text);
        setCurrentStep(1);
      } else {
        processingActions.setError();
        toast.error("Failed to generate profile summary. Please try again.");
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process uploaded files");
    }
  };

  const handleTextChunking = async () => {
    try {
      processingActions.setChunking();

      if (!user || !description) return;

      const chunkResponse = await useAuthStore
        .getState()
        .makeAuthenticatedRequest("/api/onboarding/chunkText", {
          method: "POST",
          body: JSON.stringify({ text: description }),
        });

      if (!chunkResponse.ok) {
        const error = await chunkResponse.json();
        throw new Error(error.error || "Chunking failed");
      }

      const chunkData = await chunkResponse.json();
      if (!chunkData.success) {
        throw new Error("Chunking failed");
      }

      setChunkedData({
        chunks: chunkData.chunks,
        userId: user.id,
      });

      processingActions.setSuccess();
      setCurrentStep(2);
    } catch (error) {
      console.error("Chunking failed:", error);
      processingActions.setError();
      toast.error("Failed to process your description. Please try again.");
    }
  };

  const onboardingCompleted = async () => {
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

      if (chunkedData) {
        useAuthStore
          .getState()
          .makeAuthenticatedRequest("/api/onboarding/upload", {
            method: "POST",
            body: JSON.stringify({ chunkedData }),
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
    canContinue,
    canSkip,
    nextStep,
    onboardingCompleted,
    state,
  };
};

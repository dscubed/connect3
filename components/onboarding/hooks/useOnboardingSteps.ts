import { useAuthStore } from "@/stores/authStore";
import {
  processingActions,
  useProcessingStore,
} from "@/stores/processingStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Chunk {
  chunk_id: string;
  category: string;
  content: string;
}

interface User {
  id: string;
}

interface UseOnboardingStepsParams {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  uploadedFiles: File[];
  profileImage: string | null;
  selectedFile: File | null;
  chunks: Chunk[];
  setChunks: (chunks: Chunk[]) => void;
  setIsAIChunked: (value: boolean) => void;
  user: User | null;
  updateProfile: (data: {
    onboarding_completed: boolean;
    avatar_url?: string;
    blurred_avatar_url?: string;
  }) => Promise<void>;
}

export const useOnboardingSteps = ({
  currentStep,
  setCurrentStep,
  uploadedFiles,
  profileImage,
  selectedFile,
  chunks,
  setChunks,
  setIsAIChunked,
  user,
  updateProfile,
}: UseOnboardingStepsParams) => {
  const router = useRouter();
  const { state } = useProcessingStore();

  const canContinue = () => {
    if (
      state === "parsing" ||
      state === "validating" ||
      state === "chunking" ||
      state === "uploading"
    ) {
      return false;
    }

    switch (currentStep) {
      case 0:
        return uploadedFiles.length > 0;
      case 1:
        return chunks.length > 0;
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
    }
    if (currentStep === 1 && chunks.length > 0) {
      setCurrentStep(2);
    }
  };

  // Process resume and chunk it
  const handleFileProcessing = async () => {
    try {
      const { processFiles } = await import("@/lib/documentProcessor");
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

  const onboardingCompleted = async () => {
    try {
      let avatarUrl: string | undefined = undefined;
      let blurredAvatarUrl: string | undefined = undefined;

      if (selectedFile && user?.id) {
        const { uploadAvatar } = await import("@/lib/supabase/storage");
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

      await updateProfile({
        onboarding_completed: true,
        avatar_url: avatarUrl,
        blurred_avatar_url: blurredAvatarUrl,
      });

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

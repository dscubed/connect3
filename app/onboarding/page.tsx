"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronsRightIcon as Skip,
  Check,
  Box,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import NameModal from "@/components/auth/NameModal";
import { toast } from "sonner";
import AnimatedParticles from "@/components/AnimatedParticles";
import FileUploadSection from "@/components/onboarding/file-upload/FileUploadSection";
import DescriptionSection from "@/components/onboarding/description/DescriptionSection";
import ProfilePictureSection from "@/components/onboarding/profile-picture/ProfilePictureSection";
import { useRouter } from "next/navigation";
import {
  processingActions,
  useProcessingStore,
} from "@/stores/processingStore";
import { generateProfileSummary } from "@/lib/generateSummary/generateProfileSummary";
import { BackWarningModal } from "@/components/onboarding/description/BackWarningModal";
import { ProcessingStatusIndicator } from "@/components/onboarding/file-upload/ProcessingStatusIndicator";
import { uploadToVectorStore } from "@/lib/vector-store/uploadToVectorStore";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [descriptionWordCount, setDescriptionWordCount] = useState(0);

  // Initialize word count when description already has content
  useEffect(() => {
    if (description) {
      const count = description
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      setDescriptionWordCount(count);
    }
  }, []);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get user from auth store
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { updateProfile } = useAuthStore.getState();

  const [showNameModal, setShowNameModal] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);

  useEffect(() => {
    if (
      user?.app_metadata?.provider === "google" &&
      profile &&
      profile.name_provided === false
    ) {
      setShowNameModal(true);
    }
    if (profile?.onboarding_completed === true) {
      router.push("/");
      toast.error("Onboarding already completed!");
    }
  }, [user, profile]);

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
    // Create local preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    // Store the file for later upload when onboarding completes
    setSelectedFile(file);
  };

  const handleImageRemove = () => {
    // Clear local preview and selected file
    setProfileImage(null);
    setSelectedFile(null);

    // Clean up the object URL to prevent memory leaks
    if (profileImage && profileImage.startsWith("blob:")) {
      URL.revokeObjectURL(profileImage);
    }
  };

  const canContinue = () => {
    if (
      state === "parsing" ||
      state === "validating" ||
      state === "summarizing" ||
      state === "uploading"
    )
      return false;

    switch (currentStep) {
      case 0:
        return uploadedFiles.length > 0;
      case 1:
        return descriptionWordCount >= 10;
      case 2:
        return true; // Profile picture is optional
      default:
        return false;
    }
  };

  const canSkip = () => {
    switch (currentStep) {
      case 0:
        return true; // can skip file upload
      case 1:
        return false; // cannot skip description
      case 2:
        return true; // can skip profile picture
      default:
        return true;
    }
  };

  const nextStep = async () => {
    // Handle file uploads when moving from step 0 (file upload step)
    if (currentStep === 0 && uploadedFiles.length > 0) {
      try {
        const { processFiles } = await import("@/lib/documentProcessor");
        const result = await processFiles(uploadedFiles);

        if (!result.success) {
          return;
        } else {
          // Files parsed successfully
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
          } else {
            processingActions.setError();
            toast.error(
              "Failed to generate profile summary. Please try again."
            );
            return;
          }
          setCurrentStep(1);
        }
      } catch (error) {
        console.error("Error processing files:", error);
        toast.error("Failed to process uploaded files");
        return;
      }
    }

    if (currentStep === 1 && descriptionWordCount >= 10) {
      try {
        processingActions.setUploading();
        // Call API to upload to vector store
        if (!user || !description) {
          return;
        } else {
          const result = await uploadToVectorStore(user?.id, description);
          console.log("Upload successful:", result);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        processingActions.setError();
        toast.error("Upload failed. Please try again.");
      } finally {
        setCurrentStep(currentStep + 1);
        processingActions.setSuccess();
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 1 && description.trim() !== "") {
      setShowBackWarning(true);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBack = () => {
    setDescription("");
    setCurrentStep(0);
    setShowBackWarning(false);
  };

  const skipStep = () => {
    if (currentStep == 2) {
      onboardingCompleted();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const onboardingCompleted = async () => {
    try {
      let avatarUrl = undefined;

      // Upload avatar to Supabase if a file was selected
      if (selectedFile && user?.id) {
        const { uploadAvatar } = await import("@/lib/supabase/storage");
        const result = await uploadAvatar(selectedFile, user.id);

        if (result.success) {
          avatarUrl = result.url;
          // Clean up the local preview URL
          if (profileImage && profileImage.startsWith("blob:")) {
            URL.revokeObjectURL(profileImage);
          }
        } else {
          toast.error(result.error || "Failed to upload profile picture");
          return;
        }
      }

      // Update profile with onboarding completion and avatar URL
      await updateProfile({
        onboarding_completed: true,
        avatar_url: avatarUrl,
      });

      toast.success("Welcome to connect³! Onboarding completed successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Onboarding completion error:", error);
    }
  };

  const { state, currentFile } = useProcessingStore();

  const steps = [
    {
      title: "welcome to connect³",
      subtitle: "let's get you set up in just a few steps",
      content: (
        <FileUploadSection
          onFileUpload={handleFileUpload}
          files={uploadedFiles}
          onFileRemove={handleFileRemove}
        />
      ),
    },
    {
      title: "tell your story",
      subtitle: "help others understand what makes you unique",
      content: (
        <DescriptionSection
          value={description}
          onChange={setDescription}
          onWordCountChange={setDescriptionWordCount}
        />
      ),
    },
    {
      title: "nearly there!",
      subtitle: "add a photo so people can recognize you",
      content: (
        <ProfilePictureSection
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          imageUrl={profileImage}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, #7C3AED55 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-16 h-72 w-72 rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, #06B6D455 0%, transparent 70%)",
          }}
        />
      </div>

      <AnimatedParticles />

      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center border border-white/10">
            <Box className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">
            connect<sup className="pl-0.5">3</sup>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                index <= currentStep ? "bg-white" : "bg-white/20"
              }`}
              animate={{ scale: index === currentStep ? 1.2 : 1 }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <motion.h1
                className="text-4xl md:text-5xl font-bold tracking-tight font-extrabold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {steps[currentStep].title}
              </motion.h1>
              <motion.p
                className="text-white/70 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="flex items-center justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatePresence>
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={prevStep}
                className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back
              </motion.button>
            )}
          </AnimatePresence>

          {canSkip() && (
            <button
              onClick={skipStep}
              className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
            >
              Skip for now
              <Skip className="h-4 w-4" />
            </button>
          )}

          {currentStep < 2 ? (
            <button
              onClick={nextStep}
              disabled={!canContinue()}
              className={`px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2 ${
                canContinue()
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/20 text-white/40 cursor-not-allowed"
              }`}
            >
              {state === "parsing" ||
              state === "validating" ||
              state === "summarizing"
                ? "Processing..."
                : state === "uploading"
                ? "Uploading..."
                : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                // Handle final submission - no validation needed since profile pic is optional
                onboardingCompleted();
              }}
              className="px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Complete Setup
              <Check className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </div>

      <ProcessingStatusIndicator state={state} currentFile={currentFile} />

      {showNameModal && (
        <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-auto">
          <NameModal
            open={showNameModal}
            onClose={() => setShowNameModal(false)}
          />
        </div>
      )}
      {showBackWarning && (
        <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-auto">
          <BackWarningModal
            open={showBackWarning}
            onConfirm={handleConfirmBack}
            onCancel={() => setShowBackWarning(false)}
          />
        </div>
      )}
    </div>
  );
}

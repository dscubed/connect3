"use client";
import React, { useState, useEffect } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import FileUploadSection from "@/components/onboarding/file-upload/FileUploadSection";
import ChunksSection from "@/components/onboarding/chunks/ChunksSection";
import ProfilePictureSection from "@/components/onboarding/profile-picture/ProfilePictureSection";
import { ProcessingStatusIndicator } from "@/components/onboarding/ProcessingStatusIndicator";
import { useOnboarding } from "@/components/onboarding/hooks/useOnboarding";
import { useOnboardingSteps } from "@/components/onboarding/hooks/useOnboardingSteps";
import { OnboardingModals } from "@/components/onboarding/OnboardingModals";
import { OnboardingHeader } from "@/components/onboarding/main-content/OnboardingHeader";
import { StepContent } from "@/components/onboarding/main-content/StepsComponent";
import { OnboardingNavigation } from "@/components/onboarding/main-content/NavigationProps";

export default function OnboardingPage() {
  const [showNameModal, setShowNameModal] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);

  // Use the custom hooks
  const onboardingState = useOnboarding();
  const onboardingSteps = useOnboardingSteps(onboardingState);

  const { user, profile } = onboardingState;

  useEffect(() => {
    if (
      // user?.app_metadata?.provider === "google" &&
      profile &&
      profile.name_provided === false
    ) {
      setShowNameModal(true);
    }
  }, [user, profile]);

  const handleConfirmBack = () => {
    onboardingState.setChunks([]);
    onboardingState.setCurrentStep(0);
    setShowBackWarning(false);
  };

  const prevStep = () => {
    if (
      onboardingState.currentStep === 1 &&
      onboardingState.chunks.length > 0
    ) {
      setShowBackWarning(true);
      return;
    }

    if (onboardingState.currentStep > 0) {
      onboardingState.setCurrentStep(onboardingState.currentStep - 1);
    }
  };

  const skipStep = () => {
    if (onboardingState.currentStep === 2) {
      onboardingSteps.onboardingCompleted();
    } else {
      onboardingState.setCurrentStep(onboardingState.currentStep + 1);
    }
    if (onboardingState.currentStep === 0) {
      onboardingState.setIsAIChunked(false);
    }
  };

  const steps = [
    {
      title: "welcome to connect3",
      subtitle: "let's get you set up in just a few steps",
      content: (
        <FileUploadSection
          onFileUpload={onboardingState.handleFileUpload}
          files={onboardingState.uploadedFiles}
          onFileRemove={onboardingState.handleFileRemove}
        />
      ),
    },
    {
      title: "Your key highlights",
      subtitle: onboardingState.isAIChunked
        ? "review and edit the highlights extracted by AI"
        : "let's add some highlights to make your profile stand out or go back and upload your resume to speed things up!",
      content: (
        <ChunksSection
          chunks={onboardingState.chunks}
          setChunks={onboardingState.setChunks}
          isAIChunked={onboardingState.isAIChunked}
        />
      ),
    },
    {
      title: "nearly there!",
      subtitle: "add a photo so people can recognize you",
      content: (
        <ProfilePictureSection
          onImageUpload={onboardingState.handleImageUpload}
          onImageRemove={onboardingState.handleImageRemove}
          imageUrl={onboardingState.profileImage}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <AnimatedParticles particlesCount={100} />
      <OnboardingHeader
        currentStep={onboardingState.currentStep}
        totalSteps={steps.length}
      />
      <StepContent currentStep={onboardingState.currentStep} steps={steps} />

      <OnboardingNavigation
        currentStep={onboardingState.currentStep}
        canContinue={onboardingSteps.canContinue()}
        canSkip={onboardingSteps.canSkip()}
        state={onboardingSteps.state}
        onNext={onboardingSteps.nextStep}
        onPrev={prevStep}
        onSkip={skipStep}
        onComplete={onboardingSteps.onboardingCompleted}
      />

      <ProcessingStatusIndicator state={onboardingSteps.state} currentFile="" />
      <OnboardingModals
        showNameModal={showNameModal}
        showBackWarning={showBackWarning}
        onConfirmBack={handleConfirmBack}
        onCancelBack={() => setShowBackWarning(false)}
        onCloseNameModal={() => setShowNameModal(false)}
      />
    </div>
  );
}

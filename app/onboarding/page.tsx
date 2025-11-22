"use client";
import React, { useState, useEffect } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import FileUploadSection from "@/components/onboarding/file-upload/FileUploadSection";
import ChunksSection from "@/components/onboarding/chunks/ChunksSection";
import ProfilePictureSection from "@/components/onboarding/profile-picture/ProfilePictureSection";
import { ProcessingStatusIndicator } from "@/components/onboarding/ProcessingStatusIndicator";
import { OnboardingModals } from "@/components/onboarding/OnboardingModals";
import { OnboardingHeader } from "@/components/onboarding/main-content/OnboardingHeader";
import { StepContent } from "@/components/onboarding/main-content/StepsComponent";
import { OnboardingNavigation } from "@/components/onboarding/main-content/OnboardingNavigation";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "@/components/onboarding/context/OnboardingContext";
import { useAuthStore } from "@/stores/authStore";

function OnboardingContent() {
  const [showNameModal, setShowNameModal] = useState(false);

  const { user, profile } = useAuthStore();
  const { isAIChunked } = useOnboardingContext();

  useEffect(() => {
    if (profile && profile.name_provided === false) {
      setShowNameModal(true);
    }
  }, [user, profile]);

  const steps = [
    {
      title: "welcome to connect3",
      subtitle: "let's get you set up in just a few steps",
      content: <FileUploadSection />,
    },
    {
      title: "Your key highlights",
      subtitle: isAIChunked
        ? "review and edit the highlights extracted by AI"
        : "let's add some highlights to make your profile stand out or go back and upload your resume to speed things up!",
      content: <ChunksSection />,
    },
    {
      title: "nearly there!",
      subtitle: "add a photo so people can recognize you",
      content: <ProfilePictureSection />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <AnimatedParticles particlesCount={100} />
      <OnboardingHeader totalSteps={steps.length} />
      <StepContent steps={steps} />

      <OnboardingNavigation />

      <ProcessingStatusIndicator />
      <OnboardingModals
        showNameModal={showNameModal}
        onCloseNameModal={() => setShowNameModal(false)}
      />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

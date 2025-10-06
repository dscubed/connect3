import React from "react";
import { ProgressIndicator } from "./ProgressIndicator";
import Logo from "@/components/Logo";

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingHeader = ({
  currentStep,
  totalSteps,
}: OnboardingHeaderProps) => {
  return (
    <div className="relative z-10 flex items-center justify-between p-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8" />
        <span className="font-semibold text-lg tracking-tight">connect3</span>
      </div>

      <ProgressIndicator totalSteps={totalSteps} currentStep={currentStep} />
    </div>
  );
};

import React from "react";
import { Box } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";

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
        <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center border border-white/10">
          <Box className="h-5 w-5" />
        </div>
        <span className="font-semibold tracking-tight">
          connect<sup className="pl-0.5">3</sup>
        </span>
      </div>

      <ProgressIndicator totalSteps={totalSteps} currentStep={currentStep} />
    </div>
  );
};

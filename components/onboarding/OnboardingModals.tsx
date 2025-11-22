import React from "react";
import NameModal from "@/components/auth/NameModal";
import { BackWarningModal } from "@/components/onboarding/chunks/BackWarningModal";
import { useOnboardingContext } from "./context/OnboardingContext";

interface OnboardingModalsProps {
  showNameModal: boolean;
  onCloseNameModal: () => void;
}

export const OnboardingModals = ({
  showNameModal,
  onCloseNameModal,
}: OnboardingModalsProps) => {
  const { handleConfirmBack, showBackWarning, setShowBackWarning } =
    useOnboardingContext();

  return (
    <>
      {showNameModal && (
        <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-auto">
          <NameModal open={showNameModal} onClose={onCloseNameModal} />
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
    </>
  );
};

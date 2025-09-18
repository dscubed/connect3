import React from "react";
import NameModal from "@/components/auth/NameModal";
import { BackWarningModal } from "@/components/onboarding/chunks/BackWarningModal";

interface OnboardingModalsProps {
  showNameModal: boolean;
  showBackWarning: boolean;
  onCloseNameModal: () => void;
  onConfirmBack: () => void;
  onCancelBack: () => void;
}

export const OnboardingModals = ({
  showNameModal,
  showBackWarning,
  onCloseNameModal,
  onConfirmBack,
  onCancelBack,
}: OnboardingModalsProps) => {
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
            onConfirm={onConfirmBack}
            onCancel={onCancelBack}
          />
        </div>
      )}
    </>
  );
};

"use client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AlreadyAuthenticatedDialog({
  onboardingCompleted,
}: {
  onboardingCompleted?: boolean;
}) {
  const router = useRouter();
  const handleGo = () => {
    if (onboardingCompleted === false) {
      router.replace("/onboarding");
    } else {
      router.replace("/");
    }
  };
  return (
    <Dialog open={true}>
      <DialogContent
        forceMount={true}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Already Authenticated</DialogTitle>
          <DialogDescription>
            You are already signed in. Would you like to go to the next step?
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full" onClick={handleGo}>
          {onboardingCompleted === false ? "Go to Onboarding" : "Go Home"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

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

export default function AlreadyAuthenticatedDialog() {
  const router = useRouter();
  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        forceMount={true}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Already Authenticated</DialogTitle>
          <DialogDescription>
            You are already signed in. Would you like to go home?
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full" onClick={() => router.replace("/")}>
          Go Home
        </Button>
      </DialogContent>
    </Dialog>
  );
}

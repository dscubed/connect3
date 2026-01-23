"use client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProfilePageContent } from "@/app/profile/ProfilePageContent";

interface ProfileSheetProps {
  profileId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSheet({ profileId, isOpen, onClose }: ProfileSheetProps) {
  if (!profileId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full !max-w-3xl sm:!max-w-3xl p-0 overflow-hidden bg-white">
        <SheetTitle className="sr-only">Profile Details</SheetTitle>
        <ProfilePageContent
          profileId={profileId}
          editingProfile={false}
          setEditingProfile={() => {}}
        />
      </SheetContent>
    </Sheet>
  );
}

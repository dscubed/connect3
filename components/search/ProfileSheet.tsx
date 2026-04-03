"use client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ProfilePageContent } from "@/app/profile/ProfilePageContent";

interface ProfileSheetProps {
  profileId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSheet({
  profileId,
  isOpen,
  onClose,
}: ProfileSheetProps) {
  if (!profileId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        side="right"
        closeButtonPosition="left"
        className="w-full !max-w-2xl  p-0 gap-0 flex flex-col overflow-hidden bg-white"
      >
        <SheetTitle className="sr-only">Profile Details</SheetTitle>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <ProfilePageContent
            profileId={profileId}
            editingProfile={false}
            setEditingProfile={() => {}}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

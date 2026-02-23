import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfileEditContext } from "../hooks/ProfileEditProvider";

interface ProfileModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProfileModal({ isOpen, setIsOpen }: ProfileModalProps) {
  const { profile } = useAuthStore.getState();
  const { draft, setDraftFields } = useProfileEditContext();
  const [firstName, setFirstName] = useState(draft?.first_name || "");
  const [lastName, setLastName] = useState<string | null>(
    draft?.last_name ?? null,
  );

  useEffect(() => {
    if (!isOpen) return;
    setFirstName(draft?.first_name || "");
    setLastName(draft?.last_name ?? null);
  }, [isOpen, draft]);

  if (!profile) {
    return null;
  }

  function save() {
    if (!profile) return;

    const isOrg = profile.account_type === "organisation";

    if (isOrg) {
      if (!firstName.trim()) {
        toast.error("Organisation name is empty.");
        return;
      }
    } else {
      if (!firstName.trim() || !lastName?.trim()) {
        toast.error("First or last name is empty.");
        return;
      }
    }

    setDraftFields({
      first_name: firstName,
      last_name: lastName,
    });
    setIsOpen(false);
  }

  const inputClass =
    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={true}
        className="bg-secondary border-none rounded-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="font-medium">Edit Profile</DialogTitle>
        </DialogHeader>
        <span className="w-full border-t border-muted/20 block" />
        <h1 className="text-base sm:text-xl font-semibold">Display name</h1>
        {/* Name Input */}
        {profile?.account_type == "user" ? (
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Display name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`mb-2 ${inputClass}`}
            />
            <Input
              placeholder="Display name"
              value={lastName || ""}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <Input
            placeholder="Display name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        )}

        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="rounded-full bg-gray-200 px-4 py-1.5 text-muted hover:bg-gray-300 hover:text-card-foreground"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="ghost"
            className="rounded-full bg-purple-500 px-4 py-1.5 text-white hover:bg-purple-600 hover:text-white"
            onClick={() => save()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

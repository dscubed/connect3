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
import { UniversityInput } from "./UniversityInput";
import { University } from "./univeristies";
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
  const [university, setUniversity] = useState<University | null>(
    draft?.university ?? null,
  );

  useEffect(() => {
    if (!isOpen) return;
    setFirstName(draft?.first_name || "");
    setLastName(draft?.last_name ?? null);
    setUniversity(draft?.university ?? null);
  }, [isOpen, draft]);

  if (!profile) {
    return null;
  }

  function save() {
    if (!profile) return;

    console.log("Saving profile with university:", university);

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

    console.log("Updating profile:", {
      first_name: firstName,
      last_name: lastName,
      university: university,
    });

    setDraftFields({
      first_name: firstName,
      last_name: lastName,
      university: university,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={true}
        className="bg-secondary"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <span className="w-full border-t border-muted/20 block" />
        <h1 className="text-xl font-semibold mb-2">Name</h1>
        {/* Name Input */}
        {profile?.account_type == "user" ? (
          <div className="flex flex-row gap-2">
            <Input
              placeholder={profile.first_name || `First Name`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder={profile.last_name || `Last Name`}
              value={lastName || ""}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        ) : (
          <Input
            placeholder={profile.first_name || `Organisation Name`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        )}
        <h1 className="text-xl font-semibold mb-2">University</h1>
        <UniversityInput
          value={university}
          onChange={(value) => setUniversity(value)}
        />

        <DialogFooter className="flex gap-4">
          <DialogClose asChild>
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => save()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

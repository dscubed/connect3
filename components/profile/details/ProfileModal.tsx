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
import { uploadProfileToVectorStore } from "@/lib/vectorStores/client";

interface ProfileModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProfileModal({ isOpen, setIsOpen }: ProfileModalProps) {
  const { profile, updateProfile } = useAuthStore.getState();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [university, setUniversity] = useState<University | null>(
    (profile?.university as University) || null
  );

  useEffect(() => {
    console.log("University changed:", university);
  }, [university]);

  if (!profile) {
    return null;
  }

  function save() {
    if (!profile) return;

    console.log("Saving profile with university:", university);
    updateProfile({
      first_name: firstName,
      last_name: lastName,
      university: university,
    });
    setIsOpen(false);
    uploadProfileToVectorStore();
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
              value={lastName}
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

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface NameModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (firstName: string, lastName: string) => void;
}

export default function NameModal({
  open,
  onClose,
  onSuccess,
}: NameModalProps) {
  const profile = useAuthStore((state) => state.profile);
  const { updateProfile } = useAuthStore.getState();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
    }
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Please confirm your name</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!firstName.trim() || !lastName.trim()) return;
            
            setIsLoading(true);
            try {
              await updateProfile({
                first_name: firstName,
                last_name: lastName,
                name_provided: true,
              });
              
              toast.success(
                `Welcome, ${firstName} ${lastName}! Your name was successfully updated.`
              );
              
              onSuccess?.(firstName, lastName);
              onClose();
            } catch (error) {
              toast.error("Failed to update your name. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
          <DialogFooter className="flex gap-2 mt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || !firstName.trim() || !lastName.trim()}
            >
              {isLoading ? "Updating..." : "Submit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

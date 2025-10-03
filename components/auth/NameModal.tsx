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
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface NameModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (
    firstName: string,
    lastName: string,
    accountType: "user" | "organisation"
  ) => void;
}

export default function NameModal({
  open,
  onClose,
  onSuccess,
}: NameModalProps) {
  const profile = useAuthStore((state) => state.profile);
  const { updateProfile } = useAuthStore.getState();

  const [accountType, setAccountType] = useState<"user" | "organisation">(
    "user"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setAccountType(profile.account_type ?? "user");
    }
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Please confirm your details</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              !firstName.trim() ||
              (accountType === "user" && !lastName.trim())
            )
              return;

            setIsLoading(true);
            try {
              await updateProfile({
                first_name: firstName,
                last_name: accountType === "user" ? lastName : "",
                account_type: accountType,
                name_provided: true,
              });

              const displayName =
                accountType === "user" ? `${firstName} ${lastName}` : firstName;

              toast.success(
                `Welcome, ${displayName}! Your details were successfully updated.`
              );

              onSuccess?.(firstName, lastName, accountType);
              onClose();
            } catch {
              toast.error("Failed to update your details. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          {/* Account Type Tabs */}
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant={accountType === "user" ? "default" : "outline"}
              onClick={() => setAccountType("user")}
              className="flex-1"
              disabled={isLoading}
            >
              User
            </Button>
            <Button
              type="button"
              variant={accountType === "organisation" ? "default" : "outline"}
              onClick={() => {
                setAccountType("organisation");
                setLastName(""); // Clear last name when switching to organisation
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Organisation
            </Button>
          </div>

          {/* Name Fields */}
          <div className="flex gap-2">
            <div className="flex-1 grid gap-2">
              <Label htmlFor="first-name">
                {accountType === "user" ? "First Name" : "Organisation Name"}
              </Label>
              <Input
                id="first-name"
                type="text"
                placeholder={
                  accountType === "user" ? "First Name" : "Organisation Name"
                }
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {accountType === "user" && (
              <div className="flex-1 grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isLoading ||
                !firstName.trim() ||
                (accountType === "user" && !lastName.trim())
              }
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

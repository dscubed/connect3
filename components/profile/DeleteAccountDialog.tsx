"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/lib/actions/deleteAccount";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [emailInput, setEmailInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const userEmail = user?.email ?? "";
  const emailMatches = emailInput === userEmail && emailInput.length > 0;

  function handleClose(isOpen: boolean) {
    if (deleting) return;
    if (!isOpen) {
      setEmailInput("");
      setError("");
    }
    onOpenChange(isOpen);
  }

  async function handleDelete() {
    if (!emailMatches) return;

    setError("");
    setDeleting(true);

    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted successfully.");
        await signOut();
        window.location.href = "/";
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-none rounded-2xl">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All your data will be
            deleted. Please enter your email address to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="confirm-email-nofill"
            className="text-sm text-muted-foreground"
          >
            Enter your email to verify
          </label>
          <Input
            ref={inputRef}
            type="text"
            name="confirm-email-nofill"
            id="confirm-email-nofill"
            className="focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400"
            placeholder="Enter your email address"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
            disabled={deleting}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="rounded-full px-4 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-700"
            onClick={() => handleClose(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="rounded-full px-4 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
            onClick={handleDelete}
            disabled={deleting || !emailMatches}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

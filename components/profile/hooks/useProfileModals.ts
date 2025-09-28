"use client";
import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

export interface Profile {
  first_name?: string;
  last_name?: string;
  location?: string;
  status?: string;
  tldr?: string;
}

export type ModalType = "name" | "location" | "status" | "tldr" | null;

export function useProfileModals(profile: Profile | null) {
  const { updateProfile } = useAuthStore();

  // Which modal is open
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // Editing state for all fields
  const [editing, setEditing] = useState<Profile>({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    location: profile?.location || "",
    status: profile?.status || "",
    tldr: profile?.tldr || "",
  });

  // Sync editing state when profile changes
  const syncWithProfile = useCallback((newProfile: Profile | null) => {
    setEditing({
      first_name: newProfile?.first_name || "",
      last_name: newProfile?.last_name || "",
      location: newProfile?.location || "",
      status: newProfile?.status || "",
      tldr: newProfile?.tldr || "",
    });
  }, []);

  // Open modal and reset editing state for that field
  const handleOpen = useCallback(
    (type: ModalType) => {
      if (!profile) return;
      setEditing({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        location: profile.location || "",
        status: profile.status || "",
        tldr: profile.tldr || "",
      });
      setOpenModal(type);
    },
    [profile]
  );

  // Close modal
  const handleClose = useCallback(() => {
    setOpenModal(null);
  }, []);

  // Save handlers
  const handleSave = useCallback(
    async (type: ModalType, directValue?: string) => {
      try {
        if (!type) return;
        let payload: Partial<Profile> = {};
        if (type === "name") {
          payload = {
            first_name: editing.first_name?.trim(),
            last_name: editing.last_name?.trim(),
          };
        } else if (type === "location") {
          const locationValue = directValue || editing.location?.trim();
          payload = { location: locationValue };
        } else if (type === "status") {
          payload = { status: editing.status?.trim() };
        } else if (type === "tldr") {
          payload = { tldr: editing.tldr?.trim() };
        }
        await updateProfile(payload);
        setOpenModal(null);
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
    [editing, updateProfile]
  );

  // Editing setters
  const setField = (field: keyof Profile, value: string) => {
    setEditing((prev) => {
      const newState = { ...prev, [field]: value };
      return newState;
    });
  };

  return {
    openModal, // which modal is open
    handleOpen, // open a modal
    handleClose, // close modal
    handleSave, // save changes
    editing, // editing state
    setField, // set editing field
    syncWithProfile,
  };
}

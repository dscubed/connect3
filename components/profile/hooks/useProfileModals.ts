import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface Profile {
  first_name?: string;
  last_name?: string;
  location?: string;
  status?: string;
  tldr?: string;
}

export function useProfileModals(profile: Profile | null) {
  const { updateProfile } = useAuthStore();

  // Modal visibility states
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTLDRModal, setShowTLDRModal] = useState(false);

  // Editing states
  const [editingFirstName, setEditingFirstName] = useState(
    profile?.first_name || ""
  );
  const [editingLastName, setEditingLastName] = useState(
    profile?.last_name || ""
  );
  const [editingLocation, setEditingLocation] = useState(
    profile?.location || ""
  );
  const [editingStatus, setEditingStatus] = useState(profile?.status || "");
  const [editingTLDR, setEditingTLDR] = useState(profile?.tldr || "");

  // Sync editing states when profile changes
  const syncWithProfile = useCallback((newProfile: Profile | null) => {
    if (newProfile) {
      setEditingFirstName(newProfile.first_name || "");
      setEditingLastName(newProfile.last_name || "");
      setEditingLocation(newProfile.location || "");
      setEditingStatus(newProfile.status || "");
      setEditingTLDR(newProfile.tldr || "");
    }
  }, []);

  // Modal handlers
  const handleNameClick = useCallback(() => {
    if (profile) {
      setEditingFirstName(profile.first_name || "");
      setEditingLastName(profile.last_name || "");
      setShowNameModal(true);
    }
  }, [profile]);

  const handleLocationClick = useCallback(() => {
    if (profile) {
      setEditingLocation(profile.location || "");
      setShowLocationModal(true);
    }
  }, [profile]);

  const handleStatusClick = useCallback(() => {
    if (profile) {
      setEditingStatus(profile.status || "");
      setShowStatusModal(true);
    }
  }, [profile]);

  const handleTLDRClick = useCallback(() => {
    if (profile) {
      setEditingTLDR(profile.tldr || "");
      setShowTLDRModal(true);
    }
  }, [profile]);

  // Save handlers
  const handleSaveName = useCallback(async () => {
    try {
      await updateProfile({
        first_name: editingFirstName.trim(),
        last_name: editingLastName.trim(),
      });
      setShowNameModal(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  }, [editingFirstName, editingLastName, updateProfile]);

  const handleSaveLocation = useCallback(async () => {
    try {
      await updateProfile({
        location: editingLocation.trim(),
      });
      setShowLocationModal(false);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  }, [editingLocation, updateProfile]);

  const handleSaveStatus = useCallback(async () => {
    try {
      await updateProfile({
        status: editingStatus.trim(),
      });
      setShowStatusModal(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }, [editingStatus, updateProfile]);

  const handleSaveTLDR = useCallback(async () => {
    try {
      await updateProfile({
        tldr: editingTLDR.trim(),
      });
      setShowTLDRModal(false);
    } catch (error) {
      console.error("Failed to update TLDR:", error);
    }
  }, [editingTLDR, updateProfile]);

  // Cancel handlers
  const handleTLDRCancel = useCallback(() => {
    setEditingTLDR(profile?.tldr || "");
    setShowTLDRModal(false);
  }, [profile?.tldr]);

  return {
    // Modal states
    modals: {
      showNameModal,
      showLocationModal,
      showStatusModal,
      showTLDRModal,
    },

    // Modal controls
    openModal: {
      name: handleNameClick,
      location: handleLocationClick,
      status: handleStatusClick,
      tldr: handleTLDRClick,
    },

    closeModal: {
      name: () => setShowNameModal(false),
      location: () => setShowLocationModal(false),
      status: () => setShowStatusModal(false),
      tldr: handleTLDRCancel,
    },

    // Save handlers
    save: {
      name: handleSaveName,
      location: handleSaveLocation,
      status: handleSaveStatus,
      tldr: handleSaveTLDR,
    },

    // Editing states
    editing: {
      firstName: editingFirstName,
      lastName: editingLastName,
      location: editingLocation,
      status: editingStatus,
      tldr: editingTLDR,
    },

    // Setters for editing states
    setEditing: {
      firstName: setEditingFirstName,
      lastName: setEditingLastName,
      location: setEditingLocation,
      status: setEditingStatus,
      tldr: setEditingTLDR,
    },

    // Sync function
    syncWithProfile,
  };
}

"use client";
import EditNameModal from "@/components/profile/edit-modals/EditNameModal";
import EditLocationModal from "@/components/profile/edit-modals/EditLocationModal";
import EditStatusModal from "@/components/profile/edit-modals/EditStatusModal";
import EditTLDRModal from "@/components/profile/edit-modals/EditTLDRModal";

interface Profile {
  first_name?: string;
  last_name?: string;
  location?: string;
  status?: string;
  tldr?: string;
}

interface ProfileModalsProps {
  profile: Profile | null;
  modals: {
    showNameModal: boolean;
    showLocationModal: boolean;
    showStatusModal: boolean;
    showTLDRModal: boolean;
  };
  closeModal: {
    name: () => void;
    location: () => void;
    status: () => void;
    tldr: () => void;
  };
  save: {
    name: () => Promise<void>;
    location: () => Promise<void>;
    status: () => Promise<void>;
    tldr: () => Promise<void>;
  };
  editing: {
    firstName: string;
    lastName: string;
    location: string;
    status: string;
    tldr: string;
  };
  setEditing: {
    firstName: (value: string) => void;
    lastName: (value: string) => void;
    location: (value: string) => void;
    status: (value: string) => void;
    tldr: (value: string) => void;
  };
}

export default function ProfileModals({
  profile,
  modals,
  closeModal,
  save,
  editing,
  setEditing,
}: ProfileModalsProps) {
  return (
    <>
      <EditNameModal
        isOpen={modals.showNameModal}
        currentFirstName={profile?.first_name || ""}
        currentLastName={profile?.last_name || ""}
        onClose={closeModal.name}
        onSave={save.name}
        setFirstName={setEditing.firstName}
        setLastName={setEditing.lastName}
      />

      <EditLocationModal
        isOpen={modals.showLocationModal}
        currentLocation={profile?.location || ""}
        onClose={closeModal.location}
        onSave={save.location}
        setLocation={setEditing.location}
      />

      <EditStatusModal
        isOpen={modals.showStatusModal}
        currentStatus={profile?.status || ""}
        onClose={closeModal.status}
        onSave={save.status}
        setStatus={setEditing.status}
      />

      <EditTLDRModal
        isOpen={modals.showTLDRModal}
        value={editing.tldr}
        onClose={closeModal.tldr}
        onSave={save.tldr}
        onChange={setEditing.tldr}
      />
    </>
  );
}

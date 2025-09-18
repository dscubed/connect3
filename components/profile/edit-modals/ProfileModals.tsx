import EditNameModal from "@/components/profile/edit-modals/EditNameModal";
import EditLocationModal from "@/components/profile/edit-modals/EditLocationModal";
import EditStatusModal from "@/components/profile/edit-modals/EditStatusModal";
import EditTLDRModal from "@/components/profile/edit-modals/EditTLDRModal";
import {
  Profile,
  ModalType,
} from "@/components/profile/hooks/useProfileModals";

export default function ProfileModals({
  modal,
  editing,
  setField,
  handleClose,
  handleSave,
}: {
  modal: ModalType;
  editing: Profile;
  setField: (field: keyof Profile, value: string) => void;
  handleClose: () => void;
  handleSave: (type: ModalType) => void;
}) {
  return (
    <>
      <EditNameModal
        isOpen={modal === "name"}
        currentFirstName={editing.first_name || ""}
        currentLastName={editing.last_name || ""}
        onClose={handleClose}
        onSave={() => handleSave("name")}
        setFirstName={(v) => setField("first_name", v)}
        setLastName={(v) => setField("last_name", v)}
      />

      <EditLocationModal
        isOpen={modal === "location"}
        currentLocation={editing.location || ""}
        onClose={handleClose}
        onSave={() => handleSave("location")}
        setLocation={(v) => setField("location", v)}
      />

      <EditStatusModal
        isOpen={modal === "status"}
        currentStatus={editing.status || ""}
        onClose={handleClose}
        onSave={() => handleSave("status")}
        setStatus={(v) => setField("status", v)}
      />

      <EditTLDRModal
        isOpen={modal === "tldr"}
        value={editing.tldr || ""}
        onClose={handleClose}
        onSave={() => handleSave("tldr")}
        onChange={(v) => setField("tldr", v)}
      />
    </>
  );
}

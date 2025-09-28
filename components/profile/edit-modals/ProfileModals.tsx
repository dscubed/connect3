import EditNameModal from "@/components/profile/edit-modals/EditNameModal";
import EditLocationModal from "@/components/profile/edit-modals/EditLocationModal";
import EditStatusModal from "@/components/profile/edit-modals/EditStatusModal";
import EditTLDRModal from "@/components/profile/edit-modals/EditTLDRModal";
import {
  Profile,
  ModalType,
  SaveArgs,
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
  handleSave: (args: SaveArgs) => void;
}) {
  return (
    <>
      <EditNameModal
        isOpen={modal === "name"}
        currentFirstName={editing.first_name || ""}
        currentLastName={editing.last_name || ""}
        onClose={handleClose}
        onSave={(first, last) =>
          handleSave({ type: "name", value: { first, last } })
        }
      />

      <EditLocationModal
        isOpen={modal === "location"}
        currentLocation={editing.location || ""}
        onClose={handleClose}
        onSave={(location) => handleSave({ type: "location", value: location })}
      />

      <EditStatusModal
        isOpen={modal === "status"}
        currentStatus={editing.status || ""}
        onClose={handleClose}
        onSave={(status) => handleSave({ type: "status", value: status })}
      />

      <EditTLDRModal
        isOpen={modal === "tldr"}
        value={editing.tldr || ""}
        onClose={handleClose}
        onSave={() => handleSave({ type: "tldr" })}
        onChange={(v) => setField("tldr", v)}
      />
    </>
  );
}

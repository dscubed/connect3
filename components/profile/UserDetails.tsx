"use client";
import { useState, ReactNode } from "react";
import { Pencil } from "lucide-react";
import { ProfileModal } from "./details/ProfileModal";
import { Profile } from "@/stores/authStore";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";
import { universities, type University } from "./details/univeristies";

interface UserDetailsProps {
  profile: Profile;
  editingProfile: boolean;
  /** Renders on the same line as university (e.g. social links for clubs) */
  universitySuffix?: ReactNode;
}

function EditPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/15 text-muted/80 hover:bg-muted/25 transition-colors cursor-pointer shrink-0"
    >
      <Pencil className="w-3 h-3" />
      Edit
    </button>
  );
}

export default function UserDetails({
  profile,
  editingProfile,
  universitySuffix,
}: UserDetailsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { draft } = useProfileEditContext();
  const displayFirstName =
    editingProfile && draft ? draft.first_name : profile.first_name;
  const displayLastName =
    editingProfile && draft ? draft.last_name : profile.last_name;
  const displayUniversity =
    editingProfile && draft ? draft.university : profile.university;

  return (
    <div className="flex-1">
      {/* Name */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-medium">
            {displayFirstName} {displayLastName || ""}
          </h1>
          {editingProfile && <EditPill onClick={() => setModalOpen(true)} />}
        </div>
        {/* University row - with optional suffix (e.g. social links) on the same line - read-only */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 min-h-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-normal text-muted/80 flex items-center gap-2">
              {displayUniversity != null
                ? universities[displayUniversity as University]?.name ||
                  displayUniversity ||
                  "No university set"
                : "No university set"}
            </h1>
          </div>
          {universitySuffix}
        </div>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={modalOpen} setIsOpen={setModalOpen} />
    </div>
  );
}

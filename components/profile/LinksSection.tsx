import { Profile } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { EditLinkButton } from "./links/EditLinkButton";
import { EditModal } from "./links/EditModal";
import { LinksDisplay } from "./links/LinksDisplay";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";

interface LinksSectionProps {
  editingProfile: boolean;
  profile: Profile;
}

export function LinksSection({ editingProfile, profile: _profile }: LinksSectionProps) {
  const { draft, loadingLinks, setDraftLinks } = useProfileEditContext();
  const [linkData, setLinkData] = useState(draft?.links ?? []);
  const [displayEditModal, setDisplayEditModal] = useState(false);
  const loading = loadingLinks;

  useEffect(() => {
    if (!draft) return;
    setLinkData(draft.links);
  }, [draft]);

  return (
    <>
      {!loading && (
        <div className="flex items-center gap-2 h-9 max-w-full overflow-scroll">
          {linkData.length > 0 ? (
            <LinksDisplay links={linkData} />
          ) : (
            <p className="text-muted-foreground">No links added</p>
          )}

          {editingProfile && (
            <EditLinkButton onClick={() => setDisplayEditModal(true)} />
          )}
        </div>
      )}

      <EditModal
        open={displayEditModal}
        onOpenChange={setDisplayEditModal}
        links={linkData}
        setLinks={(links) => {
          setLinkData(links);
          setDraftLinks(links);
        }}
      />
    </>
  );
}

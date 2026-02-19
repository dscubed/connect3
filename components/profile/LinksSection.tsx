import { Profile, useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditLinkButton } from "./links/EditLinkButton";
import { EditModal } from "./links/EditModal";
import { LinkItem } from "./links/LinksUtils";
import { LinksDisplay } from "./links/LinksDisplay";

interface LinksSectionProps {
  editingProfile: boolean;
  profile: Profile;
}

export function LinksSection({ editingProfile, profile }: LinksSectionProps) {
  const { loading, getSupabaseClient } = useAuthStore.getState();
  const [linkData, setLinkData] = useState<LinkItem[]>([]);
  const [fetched, setFetched] = useState(false);
  const [displayEditModal, setDisplayEditModal] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!profile || loading || fetched) return;
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from("profile_links")
        .select("id, type, details")
        .eq("profile_id", profile.id);
      if (error || !data) {
        toast.error(`Error fetching links: ${error.message}`);
        return;
      }
      setLinkData(data as LinkItem[]);
      setFetched(true);
    };
    fetchLinks();
  }, [profile, loading, supabase, fetched]);

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
        setLinks={setLinkData}
      />
    </>
  );
}

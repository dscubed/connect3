import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditLinkButton } from "./links/EditLinkButton";
import { EditModal } from "./links/EditModal";
import { LinkItem } from "./links/LinksUtils";
import { LinksDisplay } from "./links/LinksDisplay";

export function LinksSection() {
  const { profile, loading, getSupabaseClient } = useAuthStore.getState();
  const [linkData, setLinkData] = useState<LinkItem[]>([]);
  const [fetched, setFetched] = useState(false);
  const [displayEditModal, setDisplayEditModal] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!profile || loading || fetched) return;
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from("profile_links")
        .select("id, type, details");
      if (error || !data) {
        toast.error(`Error fetching links: ${error.message}`);
        return;
      }
      setLinkData(data as LinkItem[]);
      setFetched(true);
      console.log("Fetched links:", data);
    };
    fetchLinks();
  }, [profile, loading, supabase, fetched]);

  return (
    <>
      {!loading && (
        <div className="flex items-center gap-4 animate-fade-in">
          {linkData.length > 0 ? (
            <LinksDisplay links={linkData} />
          ) : (
            <p>No links added</p>
          )}
          <span className="border-l border-muted/70 h-6" />
          <EditLinkButton onClick={() => setDisplayEditModal(true)} />
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

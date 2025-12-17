import { useAuthStore } from "@/stores/authStore";
import { LinksDisplay } from "./links/LinksDisplay";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditLinkButton } from "./links/EditLinkButton";
import { EditModal } from "./links/EditModal";
import { LinkItem } from "./links/LinksUtils";

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
        .from("profile-links")
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
    <div className="w-full flex flex-col gap-6 mb-12">
      <div className="flex gap-2 items-center">
        <h1 className="text-2xl font-semibold">Links</h1>
        <EditLinkButton onClick={() => setDisplayEditModal(true)} />
      </div>

      {/* Links content goes here */}
      <LinksDisplay links={linkData} />

      <EditModal
        open={displayEditModal}
        onOpenChange={setDisplayEditModal}
        links={linkData}
        setLinks={setLinkData}
      />
    </div>
  );
}

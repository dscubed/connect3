import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkItem, LinkType } from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LinksDisplay } from "./LinksDisplay";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { LinkTypeInput } from "./LinkTypeInput";

interface EditModalProps {
  links: LinkItem[];
  setLinks: (links: LinkItem[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AddingState {
  typeInput: string;
  type?: LinkType;
  details: string;
}

export function EditModal({
  links,
  setLinks,
  open,
  onOpenChange,
}: EditModalProps) {
  const [addingLink, setAddingLink] = useState<AddingState | undefined>(
    undefined
  );
  const [prevLinks, setPrevLinks] = useState<LinkItem[]>(links);
  const [saving, setSaving] = useState(false);
  const { getSupabaseClient, profile } = useAuthStore.getState();

  const supabase = getSupabaseClient();

  const updateLink = (id: string, newDetails: string) => {
    const updatedLinks = links.map((link) =>
      link.id === id ? { ...link, details: newDetails } : link
    );
    setLinks(updatedLinks);
  };

  const deleteLink = (id: string) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
  };

  const editFunctions = {
    updateLink,
    deleteLink,
  };

  const saveToSupabase = async () => {
    setSaving(true);
    // Get deleted links
    const deletedLinks = prevLinks.filter(
      (prevLink) => !links.find((link) => link.id === prevLink.id)
    );
    // Delete links
    const { error: deleteError } = await supabase
      .from("profile-links")
      .delete()
      .in(
        "id",
        deletedLinks.map((link) => link.id)
      );
    if (deleteError) {
      console.error("Error deleting links:", deleteError);
      setSaving(false);
      toast.error(`Error deleting links: ${deleteError.message}`);
    }

    // Upsert current links
    const { error: upsertError } = await supabase.from("profile-links").upsert(
      links.map((link) => ({
        id: link.id,
        type: link.type,
        details: link.details,
        profile_id: profile?.id,
      }))
    );
    if (upsertError) {
      console.error("Error upserting links:", upsertError);
      setSaving(false);
      toast.error(`Error saving links: ${upsertError.message}`);
      return;
    }
    setSaving(false);
    toast.success("Links updated successfully!");
    onOpenChange(false);
  };

  // On open/close reset adding state and prevLinks
  useEffect(() => {
    if (!open) {
      setAddingLink(undefined);
      setPrevLinks(links);
    }
  }, [open, links]);

  const addLink = () => {
    if (addingLink && addingLink.type && addingLink.details.trim()) {
      console.log("Adding link:", addingLink);
      setLinks([
        ...links,
        {
          type: addingLink.type,
          details: addingLink.details.trim(),
          id: crypto.randomUUID(),
        },
      ]);
      setAddingLink(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary">
        <DialogHeader>
          <DialogTitle>Edit Links</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col">
          {/* Display Existing Links Here */}
          <LinksDisplay links={links} editFunctions={editFunctions} />
          {/* Add Links */}
          {addingLink ? (
            <div className="animate-fade-in">
              {/* Inputs */}
              <div className="flex gap-2 py-2 rounded-md mb-2">
                <LinkTypeInput
                  addingState={addingLink}
                  setAddingState={setAddingLink}
                />
                <Input
                  placeholder="Link Details (e.g., URL or username)"
                  value={addingLink.details}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                  onChange={(e) =>
                    setAddingLink({
                      ...addingLink,
                      details: e.target.value,
                    })
                  }
                />
              </div>
              {/* Actions */}
              <div className="flex gap-2 animate-fade-in">
                <Button variant="default" onClick={() => addLink()}>
                  Add Link
                </Button>
                <Button
                  variant="ghost"
                  className="border border-foreground/60"
                  onClick={() => setAddingLink(undefined)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-4">
              <Button
                className="w-fit h-fit animate-fade-in"
                onClick={() => setAddingLink({ typeInput: "", details: "" })}
              >
                Add Link
              </Button>
              <Button
                onClick={() =>
                  // Save to supabase
                  saveToSupabase()
                }
                disabled={saving}
                className="animate-fade-in"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

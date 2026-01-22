import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addLinksToSupabase,
  deleteLinksFromSupabase,
  LinkItem,
  LinkType,
  updateLinksInSupabase,
} from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EditLinksDisplay } from "./EditLinksDisplay";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";
import { Plus } from "lucide-react";
import { LinkInput } from "./LinkInput";

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
    undefined,
  );
  const [prevLinks, setPrevLinks] = useState<LinkItem[]>(links);
  const [saving, setSaving] = useState(false);
  const { getSupabaseClient, profile } = useAuthStore.getState();

  const supabase = getSupabaseClient();

  const updateLink = (id: string, newDetails: string) => {
    const updatedLinks = links.map((link) =>
      link.id === id ? { ...link, details: newDetails } : link,
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

    // Get deleted links and new links
    const deletedLinks = prevLinks.filter(
      (prevLink) => !links.find((link) => link.id === prevLink.id),
    );
    const newLinks = links.filter(
      (link) => !prevLinks.find((prevLink) => prevLink.id === link.id),
    );
    const updatedLinks = links.filter((link) =>
      prevLinks.find(
        (prevLink) =>
          prevLink.id === link.id && prevLink.details !== link.details,
      ),
    );

    // No changes
    if (
      deletedLinks.length === 0 &&
      newLinks.length === 0 &&
      updatedLinks.length === 0
    ) {
      toast.info("No changes to save.");
      setSaving(false);
      onOpenChange(false);
      return;
    }

    // Save changes to supabase
    console.log("Deleted links:", deletedLinks);
    await deleteLinksFromSupabase(
      deletedLinks.map((link) => link.id),
      supabase,
    );
    console.log("New links to add:", newLinks);
    await addLinksToSupabase(newLinks, supabase, profile?.id || "");
    console.log("Updated links:", updatedLinks);
    await updateLinksInSupabase(updatedLinks, supabase);
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

  const toggleOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setAddingLink(undefined);
      setLinks(prevLinks);
    }
  };

  const addLink = () => {
    if (addingLink && addingLink.type && addingLink.details.trim()) {
      if (links.some((link: LinkItem) => link.type === addingLink.type)) {
        toast.error("This link already exists.");
        return;
      }

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
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogContent className="bg-secondary">
        <DialogHeader>
          <DialogTitle>Edit Links</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col">
          {/* Display Existing Links Here */}
          <EditLinksDisplay links={links} editFunctions={editFunctions} />
          {/* Add Links */}
          {!addingLink ? (
            <Button
              className="w-full h-fit animate-fade-in hover:text-muted border hover:bg-transparent"
              variant="ghost"
              onClick={() => {
                setAddingLink({ typeInput: "", details: "" });
              }}
            >
              <Plus className="size-4" />
            </Button>
          ) : (
            <LinkInput
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              links={links.map((link) => link.type)}
              addLink={addLink}
            />
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              className="w-fit h-fit animate-fade-in"
              onClick={() => {
                toggleOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Save to supabase
                saveToSupabase();
                uploadProfileToVectorStore();
              }}
              disabled={saving}
              className="animate-fade-in"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

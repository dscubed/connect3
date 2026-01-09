import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkItem, LinkType, LinkTypes, UrlToLinkDetails } from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { EditLinksDisplay } from "./EditLinksDisplay";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { LinkTypeInput } from "./LinkTypeInput";
import { Link } from "lucide-react";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";

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
  const [url, setUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

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

  const deleteLinksFromSupabase = async (ids: string[]) => {
    console.log("Deleting links with IDs:", ids);

    // check if ids exist
    const { data, error: checkError } = await supabase
      .from("profile_links")
      .select("id")
      .in("id", ids);
    if (checkError) {
      console.error("Error checking links before deletion:", checkError);
      toast.error(`Error deleting links: ${checkError.message}`);
      return;
    }
    if (data.length === 0) {
      console.log("No links found to delete.");
      return;
    }
    const { error } = await supabase
      .from("profile_links")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Error deleting links:", error);
      toast.error(`Error deleting links: ${error.message}`);
    }
  };

  const addLinksToSupabase = async (newLinks: LinkItem[]) => {
    const { error } = await supabase.from("profile_links").insert(
      newLinks.map((link) => ({
        id: link.id,
        type: link.type,
        details: link.details,
        profile_id: profile?.id,
      }))
    );
    if (error) {
      console.error("Error adding links:", error);
      toast.error(`Error adding links: ${error.message}`);
    }
  };

  const updateLinksInSupabase = async (updatedLinks: LinkItem[]) => {
    for (const link of updatedLinks) {
      const { error } = await supabase
        .from("profile_links")
        .update({ details: link.details })
        .eq("id", link.id);
      if (error) {
        console.error("Error updating link:", error);
        toast.error(`Error updating link: ${error.message}`);
      }
    }
  };

  const saveToSupabase = async () => {
    setSaving(true);

    // Get deleted links and new links
    const deletedLinks = prevLinks.filter(
      (prevLink) => !links.find((link) => link.id === prevLink.id)
    );
    const newLinks = links.filter(
      (link) => !prevLinks.find((prevLink) => prevLink.id === link.id)
    );
    const updatedLinks = links.filter((link) =>
      prevLinks.find(
        (prevLink) =>
          prevLink.id === link.id && prevLink.details !== link.details
      )
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
    await deleteLinksFromSupabase(deletedLinks.map((link) => link.id));
    console.log("New links to add:", newLinks);
    await addLinksToSupabase(newLinks);
    console.log("Updated links:", updatedLinks);
    await updateLinksInSupabase(updatedLinks);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary">
        <DialogHeader>
          <DialogTitle>Edit Links</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col">
          {/* Display Existing Links Here */}
          <EditLinksDisplay links={links} editFunctions={editFunctions} />
          {/* Add Links */}
          {addingLink ? (
            <div className="animate-fade-in">
              {/* Inputs */}
              <div className="flex gap-2 py-2 rounded-md mb-2 items-center">
                <LinkTypeInput
                  addingState={addingLink}
                  setAddingState={setAddingLink}
                  links={links.map((link) => link.type)}
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
                <div>
                  <Button
                    variant="ghost"
                    className="!p-0 hover:bg-transparent"
                    onClick={() => {
                      setShowUrlInput(!showUrlInput);
                      setUrl("");
                    }}
                  >
                    <Link className="ml-1 size-6" />
                  </Button>
                  {showUrlInput && (
                    <div className="absolute left-1/2 translate-y-2 bg-transparent p-2 rounded-md border border-secondary-foreground/50 backdrop-blur-md">
                      <Input
                        style={{
                          width: `${Math.max(url.length, 18)}ch`,
                          maxWidth: "30ch",
                        }} // 18ch for placeholder fallback
                        className="px-2 py-1 min-w-64 w-fit border-none focus-visible:ring-0 shadow-none"
                        placeholder="Paste your URL here"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          const details = UrlToLinkDetails(e.target.value);
                          if (details) {
                            setAddingLink({
                              typeInput: LinkTypes[details.type].label,
                              type: details.type,
                              details: details.details,
                            });
                            setShowUrlInput(false);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
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
                onClick={() => {
                  setAddingLink({ typeInput: "", details: "" });
                  setShowUrlInput(false);
                  setUrl("");
                }}
              >
                Add Link
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

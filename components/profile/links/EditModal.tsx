import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkItem, LinkType } from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EditLinksDisplay } from "./EditLinksDisplay";
import { toast } from "sonner";
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

  const saveLinks = () => {
    const hasChanges =
      prevLinks.length !== links.length ||
      prevLinks.some((prevLink) => {
        const next = links.find((link) => link.id === prevLink.id);
        return !next || next.details !== prevLink.details;
      });

    if (!hasChanges) {
      toast.info("No changes to save.");
      onOpenChange(false);
      return;
    }

    setSaving(true);
    setSaving(false);
    toast.success("Links staged successfully!");
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
      <DialogContent
        showCloseButton={true}
        className="bg-secondary border-none rounded-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="font-medium">Edit Links</DialogTitle>
        </DialogHeader>
        <span className="w-full border-t border-muted/20 block" />
        <div className="flex flex-col gap-4">
          {/* Display Existing Links Here */}
          <EditLinksDisplay links={links} editFunctions={editFunctions} />
          {/* Add Links */}
          {!addingLink ? (
            <Button
              className="w-full h-fit animate-fade-in hover:text-muted border hover:bg-transparent justify-center"
              variant="ghost"
              onClick={() => {
                setAddingLink({ typeInput: "", details: "" });
              }}
            >
              <Plus className="size-4" />
              Add link
            </Button>
          ) : (
            <LinkInput
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              links={links.map((link) => link.type)}
              addLink={addLink}
            />
          )}

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="rounded-full bg-gray-200 px-4 py-1.5 text-muted hover:bg-gray-300 hover:text-card-foreground"
                onClick={() => toggleOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="ghost"
              className="rounded-full bg-purple-500 px-4 py-1.5 text-white hover:bg-purple-600 hover:text-white"
              onClick={() => saveLinks()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

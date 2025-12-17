import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkItem, LinkType } from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LinkTypes } from "./LinksUtils";
import { cn } from "@/lib/utils";
import { LinksDisplay } from "./LinksDisplay";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

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
            <div>
              {/* Inputs */}
              <div className="flex gap-2 p-2 rounded-md mb-2">
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
              <div className="flex gap-2">
                <Button variant="default" onClick={() => addLink()}>
                  Add Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAddingLink(undefined)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-4">
              <Button
                className="w-fit h-fit"
                onClick={() => setAddingLink({ typeInput: "", details: "" })}
              >
                <p>Add Link</p> <PlusCircle className="!size-5" />
              </Button>
              <Button
                onClick={() =>
                  // Save to supabase
                  saveToSupabase()
                }
                disabled={saving}
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

type LinkTypeInputProps = {
  addingState: AddingState;
  setAddingState: (state: AddingState) => void;
};

const LinkTypeInput = ({ addingState, setAddingState }: LinkTypeInputProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Filter options based on input
  const filteredOptions = Object.entries(LinkTypes).filter(([, details]) =>
    details.label.toLowerCase().includes(addingState.typeInput.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const [key, details] = filteredOptions[highlightedIndex];
      setAddingState({
        ...addingState,
        typeInput: details.label,
        type: key as LinkType,
      });
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {addingState.type &&
          LinkTypes[addingState.type]?.icon &&
          (() => {
            const Icon = LinkTypes[addingState.type].icon;
            return (
              <span className="absolute left-2">
                <Icon />
              </span>
            );
          })()}
        <Input
          placeholder="Link Type"
          className={cn(
            `${
              addingState.type && !!LinkTypes[addingState.type]?.icon
                ? "pl-8"
                : ""
            }`,
            "w-32"
          )}
          value={addingState.typeInput}
          onChange={(e) => {
            setAddingState({
              ...addingState,
              typeInput: e.target.value,
              type: undefined,
            });
            setShowDropdown(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-fit bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto scrollbar-hide">
          {filteredOptions.map(([key, details], index) => {
            const Icon = details.icon;
            return (
              <Button
                key={key}
                variant="ghost"
                className={`w-full justify-start ${
                  highlightedIndex === index ? "bg-gray-100" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  setAddingState({
                    ...addingState,
                    typeInput: details.label,
                    type: key as LinkType,
                  });
                  setShowDropdown(false);
                }}
              >
                <Icon className="mr-5" />
                {details.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

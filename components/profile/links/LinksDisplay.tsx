import { Check, PencilLine, Trash, X } from "lucide-react";
import { LinkItem, LinkTypes } from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface LinksDisplayProps {
  links: LinkItem[];
  editFunctions?: {
    updateLink: (id: string, newDetails: string) => void;
    deleteLink: (id: string) => void;
  };
}

export function LinksDisplay({ links, editFunctions }: LinksDisplayProps) {
  const { updateLink, deleteLink } = editFunctions || {};
  const [editState, setEditState] = useState<Record<string, string>>({});
  const [prevEditState, setPrevEditState] = useState<Record<string, string>>(
    {}
  );

  const onEditClick = (link: LinkItem) => {
    setEditState((prev) => ({
      ...prev,
      [link.id]: link.details,
    }));
    setPrevEditState((prev) => ({
      ...prev,
      [link.id]: link.details,
    }));
  };

  const toggleEditMode = (link: LinkItem) => {
    if (editState[link.id] !== undefined) {
      onCancelUpdate(link);
    } else {
      onEditClick(link);
    }
  };

  const onCancelUpdate = (link: LinkItem) => {
    updateLink?.(link.id, prevEditState[link.id]);
    setEditState((prev) => {
      const newState = { ...prev };
      delete newState[link.id];
      return newState;
    });
  };

  const saveEdits = (link: LinkItem) => {
    updateLink?.(link.id, editState[link.id] || link.details);
    setEditState((prev) => {
      const newState = { ...prev };
      delete newState[link.id];
      return newState;
    });
  };

  return (
    <div>
      {links.length === 0 && <p>No links added yet.</p>}
      {/* Display links here */}
      {links.map((link) => {
        const LinkIcon = LinkTypes[link.type]?.icon;
        return (
          <div key={link.id} className="flex flex-col gap-2">
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center w-full hover:bg-secondary-foreground/5 p-2 rounded-md">
                <LinkIcon className="!w-5 !h-5 flex-shrink-0" />
                {editState[link.id] !== undefined ? (
                  <Input
                    type="text"
                    value={editState[link.id]}
                    className="m-0 p-0 h-fit border-none focus-visible:ring-0 shadow-none !text-base"
                    onChange={(e) => {
                      setEditState((prev) => ({
                        ...prev,
                        [link.id]: e.target.value,
                      }));
                      setPrevEditState((prev) => ({
                        ...prev,
                        [link.id]: link.details,
                      }));
                    }}
                  />
                ) : (
                  link.details
                )}
              </div>

              {editFunctions && updateLink && deleteLink && (
                <div className="flex gap-2 items-center">
                  {editState[link.id] !== undefined && (
                    <Button
                      variant="ghost"
                      className="!p-0 h-fit"
                      onClick={() => saveEdits(link)}
                    >
                      <Check className="!size-5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="!p-0 h-fit"
                    onClick={() => toggleEditMode(link)}
                  >
                    {editState[link.id] !== undefined ? (
                      <X className="!size-5" />
                    ) : (
                      <PencilLine className="!size-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="!p-0 hover:text-red-500 hover:bg-red-700/20 h-fit"
                    onClick={() => {
                      deleteLink(link.id);
                    }}
                  >
                    <Trash className="!size-5" />
                  </Button>
                </div>
              )}
            </div>
            {/* {updateLink && editState[link.id] !== undefined && (
              <div className="w-full justify-end">
                <Button onClick={() => saveEdits(link)}>Save</Button>
              </div>
            )} */}
          </div>
        );
      })}
    </div>
  );
}

import { Check, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { LinkItem, LinkTypes } from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditLinksDisplayProps {
  links: LinkItem[];
  editFunctions: {
    updateLink: (id: string, newDetails: string) => void;
    deleteLink: (id: string) => void;
  };
}

export function EditLinksDisplay({
  links,
  editFunctions,
}: EditLinksDisplayProps) {
  const { updateLink, deleteLink } = editFunctions || {};
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleEditSave = (link: LinkItem) => {
    updateLink?.(link.id, editValue);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-1">
      {links.length === 0 && <p className="text-muted">No links added yet.</p>}
      {links.map((link) => {
        const LinkIcon = LinkTypes[link.type]?.icon;
        const isEditing = editingId === link.id;
        const isConfirmingDelete = confirmDeleteId === link.id;

        if (isEditing) {
          return (
            <div key={link.id} className="flex items-center gap-2 px-2 py-1.5">
              <LinkIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 h-8 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave(link);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-black/5"
                onClick={() => setEditingId(null)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-violet-100 text-violet-600"
                onClick={() => handleEditSave(link)}
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        }

        if (isConfirmingDelete) {
          return (
            <div
              key={link.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-sm text-red-600 truncate flex-1">
                Delete {LinkTypes[link.type]?.label}?
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-black/5"
                onClick={() => setConfirmDeleteId(null)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-red-100 text-red-600"
                onClick={() => {
                  deleteLink(link.id);
                  setConfirmDeleteId(null);
                }}
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        }

        return (
          <div
            key={link.id}
            className="group relative flex items-center w-full rounded-lg hover:bg-secondary-foreground/5 transition-colors duration-150"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0 px-2 py-2">
              <LinkIcon className="w-5 h-5 shrink-0" />
              <span className="text-sm truncate">{link.details}</span>
            </div>
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pr-1"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 rounded-md hover:bg-black/10 text-black/50 transition-colors"
                    aria-label="Link options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[110] w-36 border border-gray-200"
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingId(link.id);
                      setEditValue(link.details);
                      setConfirmDeleteId(null);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={() => {
                      setConfirmDeleteId(link.id);
                      setEditingId(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}

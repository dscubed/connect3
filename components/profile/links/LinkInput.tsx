import { Input } from "@/components/ui/input";
import { LinkTypeInput } from "./LinkTypeInput";
import {
  AddingState,
  LinkType,
  LinkTypes,
  UrlToLinkDetails,
} from "./LinksUtils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function LinkInput({
  addingLink,
  setAddingLink,
  links,
  addLink,
}: {
  addingLink: AddingState;
  setAddingLink: (state: AddingState | undefined) => void;
  links: LinkType[];
  addLink: () => void;
}) {
  return (
    <div className="animate-fade-in">
      {/* Inputs */}
      <div className="flex gap-2 py-1 rounded-md mb-2 items-center">
        {addingLink.details && (
          <LinkTypeInput
            addingState={addingLink}
            setAddingState={setAddingLink}
            links={links}
          />
        )}
        <Input
          placeholder="Paste URL or enter username"
          value={addingLink.details}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLink();
            }
          }}
          onChange={(e) => {
            const inputValue = e.target.value;
            const detectedLink = UrlToLinkDetails(inputValue);

            if (detectedLink) {
              setAddingLink({
                typeInput: LinkTypes[detectedLink.type].label,
                type: detectedLink.type,
                details: detectedLink.details,
              });
            } else {
              setAddingLink({
                ...addingLink,
                details: inputValue,
              });
            }
          }}
        />
      </div>
      {/* Actions */}
      <div className="flex w-full justify-end pr-2 gap-2 animate-fade-in">
        <Button
          variant="ghost"
          className="hover:text-muted hover:bg-muted/10 h-fit p-1"
          onClick={() => addLink()}
        >
          <Check className="size-4" />
        </Button>
        <Button
          variant="ghost"
          className="hover:text-muted hover:bg-muted/10 h-fit p-1"
          onClick={() => setAddingLink(undefined)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

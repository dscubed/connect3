import { useState } from "react";
import { LinkType, LinkTypes } from "./LinksUtils";
import { cn } from "@/lib/utils";
import { AddingState } from "./LinksUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Fade } from "@/components/ui/Fade";
import { useAuthStore } from "@/stores/authStore";

interface LinkTypeInputProps {
  addingState: AddingState;
  setAddingState: (state: AddingState) => void;
  links: LinkType[];
}

const ORG_EXCLUDED_LINKS: LinkType[] = ["discord", "linkedin-user"];
const USER_EXCLUDED_LINKS: LinkType[] = [
  "website",
  "discord-server",
  "linkedin-company",
];

export function LinkTypeInput({
  addingState,
  setAddingState,
  links,
}: LinkTypeInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { profile } = useAuthStore.getState();

  // Filter based on already added link types
  let filteredOptions = Object.entries(LinkTypes).filter(
    ([key]) => !links.includes(key as LinkType),
  );

  // Filter options based on input
  filteredOptions = filteredOptions.filter(([, details]) =>
    details.label.toLowerCase().includes(addingState.typeInput.toLowerCase()),
  );

  // filter based on profile type
  if (profile?.account_type === "organisation") {
    filteredOptions = filteredOptions.filter(
      ([key]) => !ORG_EXCLUDED_LINKS.includes(key as LinkType),
    );
  } else {
    filteredOptions = filteredOptions.filter(
      ([key]) => !USER_EXCLUDED_LINKS.includes(key as LinkType),
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
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
            "w-32 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400",
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
      <Fade show={showDropdown}>
        <div className="absolute z-10 w-fit bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 min-w-40 overflow-y-auto scrollbar-hide">
          {filteredOptions.length === 0 && (
            <div className="text-nowrap w-full text-gray-500">
              No options found
            </div>
          )}
          <div className="flex flex-col gap-1 px-2 py-2">
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
        </div>
      </Fade>
    </div>
  );
}

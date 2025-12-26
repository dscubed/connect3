import { useState } from "react";
import { universities, University } from "./univeristies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Fade } from "@/components/ui/Fade";
import { cn } from "@/lib/utils";

interface UniversityInputProps {
  value: University | null;
  onChange: (value: University | null) => void;
}

export function UniversityInput({ value, onChange }: UniversityInputProps) {
  const [inputValue, setInputValue] = useState(
    value ? universities[value].name : ""
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Filter options based on input
  const filteredOptions = Object.entries(universities).filter(([, info]) =>
    info.name.toLowerCase().includes(inputValue.toLowerCase())
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
      const [key] = filteredOptions[highlightedIndex];
      setInputValue(universities[key as University].name);
      onChange(key as University);
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="flex flex-col relative h-12 justify-center">
      {value && universities[value].logo && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
          {universities[value].logo}
        </span>
      )}
      <Input
        placeholder="Select university"
        className="w-full pl-12"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
          setHighlightedIndex(-1);
          onChange(null);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onKeyDown={handleKeyDown}
      />
      <Fade show={showDropdown}>
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto scrollbar-hide">
          {filteredOptions.length === 0 && (
            <div className="text-nowrap w-full text-gray-500 p-2">
              No options found
            </div>
          )}
          <div className="flex flex-col gap-1 px-2 py-2">
            {filteredOptions.map(([key, info], index) => (
              <Button
                key={key}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  highlightedIndex === index ? "bg-gray-100" : ""
                )}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  setInputValue(info.name);
                  onChange(key as University);
                  setShowDropdown(false);
                }}
              >
                <span className="mr-2 flex items-center justify-center [&>svg]:!size-6">
                  {info.logo}
                </span>
                {info.name}
                <span className="ml-2 text-xs text-gray-400">
                  {info.city.charAt(0).toUpperCase() + info.city.slice(1)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </Fade>
    </div>
  );
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useInstantSearch } from "@/hooks/useInstantSearch";
import { InstantSearchDropdown } from "@/components/home/InstantSearchDropdown";

interface SearchInputProps {
  defaultValue?: string;
  onSubmit: (query: string) => void;
  className?: string;
}

export function SearchInput({
  defaultValue = "",
  onSubmit,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useInstantSearch(value);

  const showDropdown =
    dropdownOpen && value.trim().length >= 2 && (isLoading || results.length > 0);

  // Sync if defaultValue changes (e.g. navigating to /search?q=foo)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value.trim()) {
      setDropdownOpen(false);
      onSubmit(value.trim());
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setDropdownOpen(true);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-3xl", className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => value.trim().length >= 2 && setDropdownOpen(true)}
            placeholder="Search for people, clubs, events..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-secondary-foreground"
          />
          <div className="flex gap-3 items-center">
            {value && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-secondary-foreground hover:text-muted-foreground disabled:text-foreground/30 transition-colors w-fit h-fit hover:bg-transparent"
                  onClick={() => {
                    setValue("");
                    setDropdownOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="w-4 h-4 flex-shrink-0" />
                </Button>
                <div className="h-5 border-l border-muted-foreground/50" />
              </>
            )}
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-secondary-foreground hover:text-muted-foreground disabled:text-foreground/30 transition-colors w-fit h-fit hover:bg-transparent"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
            </Button>
          </div>
        </div>
      </form>

      {showDropdown && (
        <InstantSearchDropdown
          query={value}
          results={results}
          isLoading={isLoading}
          onDismiss={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}

import { useRef, useState, useEffect } from "react";
import { ArrowUp, GraduationCap, Loader2, Search, X, Check } from "lucide-react";
import {
  universities,
  University,
} from "@/components/profile/details/univeristies";

const UNIVERSITY_ENTRIES = Object.entries(universities).filter(
  ([key]) => key !== "others"
) as [University, (typeof universities)[University]][];

interface SearchBarActionsProps {
  searchDisabled: boolean;
  isLoading?: boolean;
  selectedUniversities: string[];
  onUniversityChange: (uni: string) => void;
  onUniversityClear: () => void;
}

export function SearchBarActions({
  searchDisabled,
  isLoading = false,
  selectedUniversities,
  onUniversityChange,
  onUniversityClear,
}: SearchBarActionsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = UNIVERSITY_ENTRIES.filter(([, info]) =>
    info.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full justify-between">
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5 text-background bg-foreground text-sm font-medium cursor-pointer hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg"
        >
          <GraduationCap className="h-5 w-5" />
          {selectedUniversities.length > 2 && (
            <span className="text-xs">
              {selectedUniversities.length} unis
            </span>
          )}
        </button>

        {open && (
          <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50 overflow-hidden">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <input
                type="text"
                placeholder="Search university ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No universities found
                </div>
              )}
              {filtered.map(([key, info]) => {
                const isSelected = selectedUniversities.includes(key);
                return (
                  <div
                    key={key}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onUniversityChange(key)}
                    className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{info.name}</span>
                    <div
                      className={`h-4 w-4 shrink-0 rounded-sm border shadow-sm flex items-center justify-center ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-primary"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex border-t">
              <button
                type="button"
                onClick={onUniversityClear}
                className="flex-1 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Clear
              </button>
              <div className="w-px bg-border" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUniversities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedUniversities.slice(0, 3).map((key) => (
            <span
              key={key}
              className="flex items-center gap-1 rounded-full border border-foreground/20 px-2 py-0.5 text-xs"
            >
              {universities[key as University]?.name ?? key}
              <button
                type="button"
                onClick={() => onUniversityChange(key)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedUniversities.length > 3 && (
            <span className="flex items-center gap-1 rounded-full border border-foreground/20 px-2 py-0.5 text-xs">
              + {selectedUniversities.length - 3} more
              <button
                type="button"
                onClick={onUniversityClear}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="flex flex-row gap-4 items-center">
        <button
          type="submit"
          disabled={searchDisabled}
          className="flex flex-row items-center gap-2 rounded-full p-1.5 text-background bg-foreground text-sm font-medium cursor-pointer hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="inline-block h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="inline-block h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

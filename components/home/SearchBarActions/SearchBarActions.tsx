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
  const [openAbove, setOpenAbove] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenAbove(spaceAbove > spaceBelow && spaceAbove > 300);
    }
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
          className="flex items-center justify-center rounded-full p-2 text-neutral-600 bg-neutral-200 cursor-pointer hover:bg-neutral-300 transition-all hover:scale-105"
        >
          <GraduationCap className="h-5.5 w-5.5" />
          {selectedUniversities.length > 0 && (
            <span className="text-xs ml-1">
              {selectedUniversities.length} selected
            </span>
          )}
        </button>

        {open && (
          <div
            ref={popupRef}
            className={`absolute left-0 w-64 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50 overflow-hidden ${
              openAbove ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
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

      <div className="flex flex-row gap-4 items-center">
        <button
          type="submit"
          disabled={searchDisabled}
          className="flex flex-row items-center gap-2 rounded-full p-2 text-white text-sm font-medium cursor-pointer transition-all hover:scale-105 disabled:bg-purple-300 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <Loader2 className="inline-block h-5.5 w-5.5 animate-spin" />
          ) : (
            <ArrowUp className="inline-block h-5.5 w-5.5" />
          )}
        </button>
      </div>
    </div>
  );
}

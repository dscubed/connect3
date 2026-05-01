"use client";

import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavSearchInputProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export function NavSearchInput({ onExpandedChange }: NavSearchInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const expand = () => {
    setExpanded(true);
    onExpandedChange?.(true);
  };

  const collapse = () => {
    setExpanded(false);
    setValue("");
    onExpandedChange?.(false);
  };

  const collapseKeepValue = () => {
    setExpanded(false);
    onExpandedChange?.(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      collapse();
    }
  };

  return (
    <>
      {/* Mobile (< sm): icon collapsed; flex-1 row when expanded */}
      {!expanded ? (
        <button
          onClick={expand}
          className="sm:hidden flex items-center justify-center h-9 w-9 rounded-full bg-white transition-colors hover:bg-gray-50 text-muted-foreground shrink-0"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="sm:hidden flex-1 flex items-center gap-2 min-w-0"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && collapse()}
            onBlur={() => collapseKeepValue()}
            placeholder="Search for people, clubs, events..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="button"
            onClick={collapse}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* sm+: persistent pill, input always rendered, animates width */}
      <div className="w-96">
        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => {
            if (!expanded && e.target !== inputRef.current) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
          className={cn(
            "hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white h-10 px-4 shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
            expanded ? "w-96" : "w-64 cursor-pointer",
          )}
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => !expanded && expand()}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && inputRef.current?.blur()}
            onBlur={() => collapseKeepValue()}
            placeholder={
              expanded ? "Search for people, clubs, events..." : "Search..."
            }
            className={cn(
              "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0",
              !expanded && "cursor-pointer",
            )}
          />
          {expanded && (
            <button
              type="button"
              onClick={collapse}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-black/5 transition-colors text-muted-foreground hover:text-foreground shrink-0 -mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </>
  );
}

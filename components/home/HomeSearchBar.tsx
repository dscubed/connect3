"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInstantSearch } from "@/hooks/useInstantSearch";
import { InstantSearchDropdown } from "./InstantSearchDropdown";

interface HomeSearchBarProps {
  className?: string;
}

export function HomeSearchBar({ className }: HomeSearchBarProps) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { results, isLoading } = useInstantSearch(query);

  const showDropdown =
    dropdownOpen && query.trim().length >= 2 && (isLoading || results.length > 0);

  // Close dropdown on outside click
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

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setDropdownOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setDropdownOpen(true);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-[clamp(0.25rem,1vw,0.65rem)] rounded-full bg-white/90 border border-white/70 shadow-[0_14px_32px_-20px_rgba(40,20,80,0.55)] px-[clamp(0.4rem,1.6vw,0.85rem)] py-[clamp(0.25rem,1.2vw,0.65rem)] backdrop-blur-sm">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.trim().length >= 2 && setDropdownOpen(true)}
            placeholder="Search events, clubs, people..."
            className="flex-1 bg-transparent text-[clamp(0.6rem,2vw,0.9rem)] text-slate-700 placeholder:text-slate-400 outline-none"
            aria-label="Search"
          />
          <button
            type="submit"
            className="flex h-[clamp(1.1rem,4.6vw,1.95rem)] w-[clamp(1.1rem,4.6vw,1.95rem)] items-center justify-center rounded-full bg-[#3d2c8d] text-white shadow-sm transition-transform hover:scale-105"
            aria-label="Submit search"
          >
            <ArrowUp className="h-[clamp(0.5rem,1.7vw,0.9rem)] w-[clamp(0.5rem,1.7vw,0.9rem)]" />
          </button>
        </div>
      </form>

      {showDropdown && (
        <InstantSearchDropdown
          query={query}
          results={results}
          isLoading={isLoading}
          onDismiss={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}

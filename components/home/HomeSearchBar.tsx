"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeSearchBarProps {
  className?: string;
}

export function HomeSearchBar({ className }: HomeSearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] rounded-full bg-white/90 border border-white/70 shadow-[0_14px_32px_-20px_rgba(40,20,80,0.55)] px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.6vw,0.75rem)] backdrop-blur-sm">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for people, clubs, events..."
          className="flex-1 bg-transparent text-[clamp(0.9rem,1.8vw,1rem)] text-slate-700 placeholder:text-slate-400 outline-none"
          aria-label="Search"
        />
        <button
          type="submit"
          className="flex h-[clamp(2rem,6vw,2.25rem)] w-[clamp(2rem,6vw,2.25rem)] items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-transform hover:scale-105"
          aria-label="Submit search"
        >
          <ArrowUp className="h-[clamp(0.9rem,2.4vw,1rem)] w-[clamp(0.9rem,2.4vw,1rem)]" />
        </button>
      </div>
    </form>
  );
}

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
      <div className="flex items-center gap-[clamp(0.25rem,1vw,0.65rem)] rounded-full bg-white/90 border border-white/70 shadow-[0_14px_32px_-20px_rgba(40,20,80,0.55)] px-[clamp(0.4rem,1.6vw,0.85rem)] py-[clamp(0.25rem,1.2vw,0.65rem)] backdrop-blur-sm">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
  );
}

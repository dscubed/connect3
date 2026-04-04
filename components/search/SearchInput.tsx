"use client";
import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full max-w-3xl", className)}>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
  );
}

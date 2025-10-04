import React from "react";
import { ArrowUp } from "lucide-react";
import { useSearch } from "@/components/home/hooks/useSearch";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  placeholder?: string;
  onSubmit?: (query: string) => void;
  disabled?: boolean;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSubmit,
  placeholder = "Search...",
  disabled = false,
}) => {
  const {
    query: localQuery,
    isSearching,
    handleChange,
  } = useSearch({
    initialQuery: query,
    onSearchChange: setQuery,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit?.(localQuery);
    setQuery(localQuery); // Ensure immediate update on submit
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`mx-auto max-w-2xl flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur shadow-xl shadow-white/5 hover:shadow-white/10 transition-all ${
          disabled ? "opacity-50 pointer-events-none grayscale" : ""
        }`}
      >
        <input
          className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={disabled || isSearching || localQuery.trim() === ""}
          className="flex flex-row items-center gap-2 rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium cursor-pointer hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
        >
          <ArrowUp className="inline-block h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export const SearchBar = React.memo(SearchBarComponent);

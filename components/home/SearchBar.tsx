import React from "react";
import { Search } from "lucide-react";
import { useSearch } from "@/components/home/hooks/useSearch";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  placeholder?: string;
  onSubmit?: (query: string) => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSubmit,
  placeholder = "Search...",
}) => {
  const { query: localQuery, isSearching, handleChange } = useSearch({
    initialQuery: query,
    onSearchChange: setQuery,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(localQuery);
    setQuery(localQuery); // Ensure immediate update on submit
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur shadow-xl shadow-white/5 hover:shadow-white/10 transition-all">
        <Search className="h-5 w-5 text-white/60" />
        <input
          className="w-full bg-transparent outline-none placeholder:text-white/40"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => handleChange(e.target.value)}
        />
        <button 
          type="submit"
          className="rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export const SearchBar = React.memo(SearchBarComponent);

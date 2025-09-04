import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  placeholder?: string;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  placeholder = "Search...",
}) => {
  const [localQuery, setLocalQuery] = useState(query);
  // Sync local state with parent state
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);
  // Debounce the search input
  useEffect(() => {
    if (localQuery !== query) {
      const timer = setTimeout(() => {
        setQuery(localQuery);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [localQuery, query, setQuery]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur shadow-xl shadow-white/5 hover:shadow-white/10 transition-all">
      <Search className="h-5 w-5 text-white/60" />
      <input
        className="w-full bg-transparent outline-none placeholder:text-white/40"
        placeholder={placeholder}
        value={localQuery}
        onChange={handleChange}
      />
      <button className="rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg">
        Search
      </button>
    </div>
  );
};

export const SearchBar = React.memo(SearchBarComponent);

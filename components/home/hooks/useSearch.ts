import { useState, useEffect, useCallback } from "react";

// Entity filter options for dropdown
export interface EntityFilterOptions {
  events: boolean;
  organisations: boolean;
  users: boolean;
}

export function useSearch({
  initialQuery = "",
  onSearchChange,
}: {
  initialQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Sync local state with parent state
  useEffect(() => {
    setLocalQuery(initialQuery);
  }, [initialQuery]);

  // Debounce the search input
  useEffect(() => {
    if (localQuery !== initialQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        onSearchChange(localQuery);
        setIsSearching(false);
      }, 350); // Increased debounce time
      return () => clearTimeout(timer);
    }
  }, [localQuery, initialQuery, onSearchChange]);

  const handleChange = useCallback((value: string) => {
    setLocalQuery(value);
  }, []);

  return {
    query: localQuery,
    isSearching,
    handleChange,
  };
}

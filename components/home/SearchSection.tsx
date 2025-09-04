import React from "react";
import { SearchBar } from "@/components/home/SearchBar";
import SuggestedQueries from "@/components/home/SuggestedQueries";

interface SearchSectionProps {
  query: string;
  setQuery: (q: string) => void;
  suggestedQueries: string[];
  onSearch?: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  query,
  setQuery,
  suggestedQueries,
  onSearch,
}) => (
  <div className="mx-auto max-w-2xl">
    <SearchBar 
      query={query}
      setQuery={setQuery}
      onSubmit={onSearch}
      placeholder="Search by skills, vibes, or ideas (e.g. 'Ex amazon intern')…"
    />
    <SuggestedQueries 
      suggestedQueries={suggestedQueries}
      onQuerySelect={(q) => {
        setQuery(q);
        onSearch?.(q);
      }}
    />
  </div>
);

export default SearchSection;

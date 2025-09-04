import React from "react";
import { SearchBar } from "@/components/home/SearchBar";
import SuggestedQueries from "@/components/home/SuggestedQueries";

interface SearchSectionProps {
  query: string;
  setQuery: (q: string) => void;
  suggestedQueries: string[];
}

const SearchSection: React.FC<SearchSectionProps> = ({
  query,
  setQuery,
  suggestedQueries,
}) => (
  <div className="mx-auto max-w-2xl">
    <SearchBar 
      query={query}
      setQuery={setQuery}
      placeholder="Search by skills, vibes, or ideas (e.g. 'Ex amazon intern')…"
    />
    <SuggestedQueries 
      suggestedQueries={suggestedQueries}
      onQuerySelect={setQuery}
    />
  </div>
);

export default SearchSection;

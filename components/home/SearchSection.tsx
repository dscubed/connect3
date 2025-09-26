import React from "react";
import { SearchBar } from "@/components/home/SearchBar";

interface SearchSectionProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch?: (query: string) => void;
  creatingChatroom?: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  query,
  setQuery,
  onSearch,
  creatingChatroom,
}) => (
  <div className="mx-auto max-w-2xl">
    <SearchBar
      query={query}
      setQuery={setQuery}
      onSubmit={onSearch}
      placeholder="Search by skills, vibes, or ideas (e.g. 'Ex amazon intern')…"
      disabled={creatingChatroom}
    />
  </div>
);

export default SearchSection;

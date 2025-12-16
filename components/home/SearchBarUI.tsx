import React from "react";
import {
  EntityFilterOptions,
  useSearch,
} from "@/components/home/hooks/useSearch";
import { Textarea } from "../ui/TextArea";
import { SearchBarActions } from "./SearchBarActions/SearchBarActions";
import { useEntityFilter } from "./SearchBarActions/hooks/useEntityFilter";

interface SearchBarUIProps {
  query: string;
  setQuery: (q: string) => void;
  onSubmit?: (
    query: string,
    selectedEntityFilters: EntityFilterOptions
  ) => void;
  disabled?: boolean;
  isLoading?: boolean;
  containerClassName?: string;
}

const DEFAULT_CONTAINER_CLASSNAME =
  "rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur shadow-xl shadow-white/5 hover:shadow-white/10";

const SearchBarUIComponent: React.FC<SearchBarUIProps> = ({
  query,
  setQuery,
  onSubmit,
  disabled = false,
  isLoading = false,
  containerClassName = DEFAULT_CONTAINER_CLASSNAME,
}) => {
  const {
    query: localQuery,
    isSearching,
    handleChange,
  } = useSearch({
    initialQuery: query,
    onSearchChange: setQuery,
  });

  const { selectedEntityFilters, handleEntityFilterClick, selectedCount } =
    useEntityFilter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isLoading) return;
    onSubmit?.(localQuery, selectedEntityFilters);
    setQuery(localQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`mx-auto max-w-2xl flex flex-col items-center ${containerClassName} transition-all ${
          disabled || isLoading
            ? "opacity-50 pointer-events-none grayscale"
            : ""
        }`}
      >
        <div className="flex w-full items-center gap-3 py-2">
          <Textarea
            className="w-full bg-transparent outline-none text-sm placeholder:text-white/40 max-h-32 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent focus:scrollbar-thumb-white/50 transition-all resize-none text-white"
            placeholder="Ask me anything..."
            value={localQuery}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled || isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <SearchBarActions
          searchDisabled={
            disabled || isSearching || isLoading || localQuery.trim() === ""
          }
          isLoading={isLoading}
          selectedEntityFilters={selectedEntityFilters}
          handleEntityFilterClick={handleEntityFilterClick}
          selectedCount={selectedCount}
        />
      </div>
    </form>
  );
};

export const SearchBarUI = React.memo(SearchBarUIComponent);

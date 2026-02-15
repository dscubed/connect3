import React from "react";
import { useSearch } from "@/components/home/hooks/useSearch";
import { Textarea } from "../ui/TextArea";
import { SearchBarActions } from "./SearchBarActions/SearchBarActions";
import { cn } from "@/lib/utils";

interface SearchBarUIProps {
  query: string;
  setQuery: (q: string) => void;
  onSubmit?: (query: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  containerClassName?: string;
  selectedUniversities?: string[];
  onUniversityChange?: (uni: string) => void;
  onUniversityClear?: () => void;
}

const DEFAULT_CONTAINER_CLASSNAME =
  "rounded-3xl border border-foreground/20 px-4 py-3 backdrop-blur shadow-xl hover:shadow-white/10";

const SearchBarUIComponent: React.FC<SearchBarUIProps> = ({
  query,
  setQuery,
  onSubmit,
  disabled = false,
  isLoading = false,
  containerClassName = DEFAULT_CONTAINER_CLASSNAME,
  selectedUniversities = [],
  onUniversityChange = () => {},
  onUniversityClear = () => {},
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
    if (disabled || isLoading) return;
    onSubmit?.(localQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`bg-background text-foreground mx-auto max-w-3xl flex flex-col items-center ${containerClassName} transition-all ${
          disabled || isLoading
            ? "opacity-50 pointer-events-none grayscale"
            : ""
        }`}
      >
        <div className="flex w-full items-center gap-3 py-2">
          <Textarea
            className={cn(
              "w-full bg-transparent text-sm transition-all placeholder:text-foreground/50",
              "scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent focus:scrollbar-thumb-white/50",
              "max-h-32 outline-none resize-none focus-visible:ring-0 border-none min-h-0"
            )}
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
          selectedUniversities={selectedUniversities}
          onUniversityChange={onUniversityChange}
          onUniversityClear={onUniversityClear}
        />
      </div>
    </form>
  );
};

export const SearchBarUI = React.memo(SearchBarUIComponent);

import React from "react";
import { useSearch } from "@/components/home/hooks/useSearch";
import { Textarea } from "../ui/TextArea";
import { SearchBarActions } from "./searchActions/SearchBarActions";
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
  "rounded-3xl border border-gray-200 p-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]";

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
        className={`bg-white text-foreground mx-auto max-w-3xl flex flex-col items-center ${containerClassName} transition-all ${
          disabled || isLoading
            ? "opacity-50 pointer-events-none grayscale"
            : ""
        }`}
      >
        <div className="flex w-full items-center gap-3 pb-2.5">
          <Textarea
            className={cn(
              "w-full bg-transparent !text-base transition-all placeholder:text-foreground/50 pb-0 pt-1 px-2",
              "scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent focus:scrollbar-thumb-white/50",
              "max-h-32 outline-none resize-none focus-visible:ring-0 border-none min-h-12",
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

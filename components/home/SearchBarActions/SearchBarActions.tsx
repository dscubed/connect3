import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Fragment } from "react";
import { ArrowUp, Check, ChevronDown, Settings2, Square, Loader2 } from "lucide-react";
import { EntityFilterOptions } from "../hooks/useSearch";

const FILTER_OPTIONS = [
  {
    id: "events",
    label: "Events",
    description: "Workshops, Networking Events, etc.",
  },
  {
    id: "organisations",
    label: "Organisations",
    description: "Student clubs, social groups, etc.",
  },
  {
    id: "users",
    label: "Users",
    description: "Discover other fellow students",
  },
] as {
  id: string;
  label: string;
  description: string;
}[];

interface SearchBarActionsProps {
  searchDisabled: boolean;
  isLoading?: boolean;
  selectedEntityFilters: EntityFilterOptions;
  handleEntityFilterClick: (selectedFilter: keyof EntityFilterOptions) => void;
  selectedCount: number;
}

export function SearchBarActions({
  searchDisabled,
  isLoading = false,
  selectedEntityFilters,
  handleEntityFilterClick,
  selectedCount,
}: SearchBarActionsProps) {
  return (
    <div className="flex w-full justify-between">
      <div>
        <div className="border border-gray-500/50 rounded-md px-2 py-2 text-white hover:bg-zinc-400 hover:text-black transition-all">
          <Settings2 className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-row gap-4 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {selectedCount} Selected
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {FILTER_OPTIONS.map((option, index) => {
              const isSelected =
                selectedEntityFilters[
                  option.id as keyof typeof selectedEntityFilters
                ];
              return (
                <Fragment key={option.id}>
                  {index === 1 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() =>
                      handleEntityFilterClick(
                        option.id as keyof typeof selectedEntityFilters
                      )
                    }
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <div className="flex-1">
                      <h1 className="text-sm font-medium">{option.label}</h1>
                      <p className="text-xs text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    <div className="h-full w-4 rounded flex items-center justify-center">
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </DropdownMenuItem>
                </Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="submit"
          disabled={searchDisabled}
          className="flex flex-row items-center gap-2 rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium cursor-pointer hover:bg-white/90 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="inline-block h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="inline-block h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

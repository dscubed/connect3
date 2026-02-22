import { useState } from "react";
import {
  ArrowUp,
  Check,
  GraduationCap,
  Loader2,
  Search,
  X,
} from "lucide-react";
import {
  universities,
  University,
} from "@/components/profile/details/univeristies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TokenUsageIndicator } from "@/components/search/TokenUsageIndicator";

const UNIVERSITY_ENTRIES = Object.entries(universities).filter(
  ([key]) => key !== "others",
) as [University, (typeof universities)[University]][];

interface SearchBarActionsProps {
  searchDisabled: boolean;
  isLoading?: boolean;
  selectedUniversities: string[];
  onUniversityChange: (uni: string) => void;
  onUniversityClear: () => void;
}

export function SearchBarActions({
  searchDisabled,
  isLoading = false,
  selectedUniversities,
  onUniversityChange,
  onUniversityClear,
}: SearchBarActionsProps) {
  const [search, setSearch] = useState("");

  const filtered = UNIVERSITY_ENTRIES.filter(([, info]) =>
    info.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex w-full justify-between">
      <DropdownMenu onOpenChange={(open) => !open && setSearch("")}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center rounded-full p-2 text-neutral-600 bg-neutral-200 cursor-pointer hover:bg-neutral-300 transition-all hover:scale-105"
          >
            <GraduationCap className="h-5.5 w-5.5" />
            {selectedUniversities.length > 0 && (
              <span className="text-xs ml-1">
                {selectedUniversities.length} selected
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          avoidCollisions
          className="w-64 rounded-xl shadow-xl p-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <input
              type="text"
              placeholder="Search university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>

          {/* University list */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No universities found
              </div>
            )}
            {filtered.map(([key, info]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={selectedUniversities.includes(key)}
                onCheckedChange={() => onUniversityChange(key)}
                onSelect={(e) => e.preventDefault()}
              >
                {info.name}
              </DropdownMenuCheckboxItem>
            ))}
          </div>

          {/* Footer actions */}
          <DropdownMenuSeparator className="m-0" />
          <div className="flex">
            <button
              type="button"
              onClick={onUniversityClear}
              className="flex flex-1 items-center justify-center gap-1 py-2 text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
            <div className="w-px self-stretch bg-muted/80" />
            <button
              type="button"
              onClick={() => {
                onUniversityChange("all");
              }}
              className="flex flex-1 items-center justify-center gap-1 py-2 text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Select All
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-row gap-4 items-center">
        <TokenUsageIndicator />
        <button
          type="submit"
          disabled={searchDisabled}
          className="flex flex-row items-center gap-2 rounded-full p-2 text-white text-sm font-medium cursor-pointer transition-all hover:scale-105 disabled:bg-purple-300 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <Loader2 className="inline-block h-5.5 w-5.5 animate-spin" />
          ) : (
            <ArrowUp className="inline-block h-5.5 w-5.5" />
          )}
        </button>
      </div>
    </div>
  );
}

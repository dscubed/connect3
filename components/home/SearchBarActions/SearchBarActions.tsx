import { ArrowUp, Settings2, Loader2 } from "lucide-react";

interface SearchBarActionsProps {
  searchDisabled: boolean;
  isLoading?: boolean;
}

export function SearchBarActions({
  searchDisabled,
  isLoading = false,
}: SearchBarActionsProps) {
  return (
    <div className="flex w-full justify-between">
      <div>
        <div className="flex flex-row items-center gap-2 rounded-full p-1.5 text-background bg-foreground text-sm font-medium cursor-pointer hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
          <Settings2 className="h-5 w-5" />
        </div>
      </div>
      <div className="flex flex-row gap-4 items-center">
        <button
          type="submit"
          disabled={searchDisabled}
          className="flex flex-row items-center gap-2 rounded-full p-1.5 text-background bg-foreground text-sm font-medium cursor-pointer hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="inline-block h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="inline-block h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Input } from "../ui/input";
import {
  universities,
  University,
} from "@/components/profile/details/univeristies";

const UNIVERSITY_OPTIONS = [
  "All",
  ...(Object.keys(universities).filter((k) => k !== "others") as University[]),
] as const;

interface ClubFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedUniversity: string;
  setSelectedUniversity: React.Dispatch<React.SetStateAction<string>>;
}

export default function ClubFilters({
  search,
  setSearch,
  selectedUniversity,
  setSelectedUniversity,
}: ClubFiltersProps) {
  return (
    <div className="p-4 flex-row gap-3 flex w-full">
      {/* Search Input */}
      <div className="relative bg-background w-full rounded-lg text-foreground">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clubs..."
          className="text-sm outline-none border-none placeholder:text-foreground/50 shadow-none focus-visible:ring-0 px-4"
        />
        <Search className="h-4 w-4 right-4 top-[10px] absolute" />
      </div>
      {/* University Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="justify-between rounded-lg px-3 py-2 text-sm border-none text-foreground shadow-none"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-h-56 overflow-y-auto scrollbar-hide border-none px-2">
          {UNIVERSITY_OPTIONS.map((uni) => (
            <DropdownMenuItem
              key={uni}
              onClick={() => setSelectedUniversity(uni)}
              className={uni === selectedUniversity ? "font-medium" : ""}
            >
              {uni === "All"
                ? "All universities"
                : (universities[uni as University]?.name ?? uni)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

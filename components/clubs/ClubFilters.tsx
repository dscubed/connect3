import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Input } from "../ui/input";

interface ClubFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

export default function ClubFilters({ search, setSearch }: ClubFiltersProps) {
  return (
    <div className="p-4 flex-row gap-4 flex w-full">
      {/* Search Input */}
      <div className="relative bg-background w-full rounded-2xl shadow-md text-foreground">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clubs..."
          className="text-sm outline-none border-none placeholder:text-foreground/50 shadow-none focus-visible:ring-0 px-4"
        />
        <Search className="h-4 w-4 right-4 top-[10px] absolute" />
      </div>
      {/* University Filter: TO BE IMPLEMENTED */}
      <Button
        variant="outline"
        className="justify-between rounded-2xl px-3 py-2 text-sm border-none text-foreground shadow-md"
      >
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
}

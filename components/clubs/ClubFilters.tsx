import { Category } from "./ClubsData";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Input } from "../ui/input";

interface ClubFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: Category | "All";
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | "All">>;
  categoryOptions: (Category | "All")[];
}

export default function ClubFilters({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categoryOptions,
}: ClubFiltersProps) {
  return (
    <div className="p-4 flex-row gap-4 flex w-full">
      {/* Search Input */}
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search clubs..."
        className="bg-background w-full rounded-2xl px-3 py-2 text-sm outline-none border-none placeholder:text-foreground/50 text-foreground shadow-md"
      />
      {/* Category Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="justify-between rounded-2xl px-3 py-2 text-sm border-none text-foreground shadow-md"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-h-56 overflow-y-auto scrollbar-hide border-none px-2">
          {categoryOptions.slice(0, 5).map((cat) => (
            <DropdownMenuItem
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cat === selectedCategory ? "font-bold" : ""}
            >
              {cat}
            </DropdownMenuItem>
          ))}
          {categoryOptions.length > 5 && (
            <>
              <div className="border-t border-white/10 my-1" />
              {categoryOptions.slice(5).map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cat === selectedCategory ? "font-bold" : ""}
                >
                  {cat}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import { EventCategory } from "@/types/events/event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, MapPin, ChevronDown } from "lucide-react";

interface EventGridFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: EventCategory | "All";
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<EventCategory | "All">
  >;
}

export default function EventGridFilters({
  search,
  setSearch,
  location,
  setLocation,
  selectedCategory,
  setSelectedCategory,
}: EventGridFiltersProps) {
  const categoryOptions = [
    "All",
    "networking",
    "study",
    "fun",
    "workshop",
    "competition",
    "panel",
    "miscellaneous",
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Inputs */}
      <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm flex-1 min-w-[300px] max-w-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search event ..."
          className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-black placeholder:text-gray-400"
        />
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-1.5 px-3">
          <MapPin className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search location ..."
            className="py-2.5 text-sm bg-transparent outline-none text-black placeholder:text-gray-400 w-36"
          />
        </div>
        <button className="bg-white hover:bg-gray-50 p-2.5 mr-1 rounded-full transition-colors">
          <Search className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2">
        {/* All Dates dropdown (placeholder) */}
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          All Dates
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Tags dropdown (placeholder) */}
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          Tags
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Categories dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              {selectedCategory === "All" ? "Categories" : selectedCategory}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-56 overflow-y-auto scrollbar-hide">
            {categoryOptions.map((cat) => (
              <DropdownMenuItem
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cat === selectedCategory ? "font-bold" : ""}
              >
                {cat === "All" ? "All Categories" : cat}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

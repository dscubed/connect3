"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, MapPin, ChevronDown } from "lucide-react";

export type DateFilter = "all" | "today" | "this-week" | "this-month" | "upcoming";
export type SortOption = "date-asc" | "date-desc" | "name-asc" | "name-desc";
export type TagFilter = "all" | "free" | "paid" | "online" | "in-person";

interface EventGridFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  categoryOptions: string[];
  dateFilter: DateFilter;
  setDateFilter: React.Dispatch<React.SetStateAction<DateFilter>>;
  tagFilter: TagFilter;
  setTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>;
  sortOption: SortOption;
  setSortOption: React.Dispatch<React.SetStateAction<SortOption>>;
}

const dateLabels: Record<DateFilter, string> = {
  all: "All Dates",
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  upcoming: "Upcoming",
};

const tagLabels: Record<TagFilter, string> = {
  all: "All Tags",
  free: "Free",
  paid: "Paid",
  online: "Online",
  "in-person": "In-Person",
};

const sortLabels: Record<SortOption, string> = {
  "date-asc": "Date (Earliest)",
  "date-desc": "Date (Latest)",
  "name-asc": "Name (A-Z)",
  "name-desc": "Name (Z-A)",
};

function formatCategory(cat: string): string {
  return cat
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function EventGridFilters({
  search,
  setSearch,
  location,
  setLocation,
  selectedCategory,
  setSelectedCategory,
  categoryOptions,
  dateFilter,
  setDateFilter,
  tagFilter,
  setTagFilter,
  sortOption,
  setSortOption,
}: EventGridFiltersProps) {

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
        {/* Date filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200">
              {dateLabels[dateFilter]}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(dateLabels) as DateFilter[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setDateFilter(key)}
                className={key === dateFilter ? "font-bold" : ""}
              >
                {dateLabels[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200">
              {tagFilter === "all" ? "Tags" : tagLabels[tagFilter]}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(tagLabels) as TagFilter[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setTagFilter(key)}
                className={key === tagFilter ? "font-bold" : ""}
              >
                {tagLabels[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200">
              {sortLabels[sortOption]}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(sortLabels) as SortOption[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSortOption(key)}
                className={key === sortOption ? "font-bold" : ""}
              >
                {sortLabels[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Categories dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200">
              {selectedCategory === "All" ? "Categories" : formatCategory(selectedCategory)}
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
                {cat === "All" ? "All Categories" : formatCategory(cat)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

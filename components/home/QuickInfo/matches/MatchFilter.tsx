import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { FilterType } from "./types";

const filterLabels: Record<FilterType, string> = {
  all: "All Time",
  month: "Last Month",
  week: "Last 7 Days",
  day: "Last 24 Hours",
};

export default function MatchFilter({
  filter,
  setFilter,
}: {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
}) {
  return (
    <div className="mb-3 justify-center flex">
      {/* Desktop buttons */}
      <div className="gap-2 hidden sm:flex">
        {(["all", "month", "week", "day"] as FilterType[]).map((range) => (
          <button
            key={range}
            className={`px-2 py-1 rounded text-xs ${
              filter === range ? "bg-white/10 text-white" : "text-white/40"
            }`}
            onClick={() => setFilter(range)}
          >
            {filterLabels[range]}
          </button>
        ))}
      </div>
      {/* Mobile dropdown using Radix DropdownMenu */}
      <div className="sm:hidden w-full flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-1 rounded text-xs bg-white/10 text-white w-40 border border-white/20">
              {filterLabels[filter]}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-40">
            <DropdownMenuRadioGroup
              value={filter}
              onValueChange={(val) => setFilter(val as FilterType)}
            >
              {(["all", "month", "week", "day"] as FilterType[]).map(
                (range) => (
                  <DropdownMenuRadioItem key={range} value={range}>
                    {filterLabels[range]}
                  </DropdownMenuRadioItem>
                )
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

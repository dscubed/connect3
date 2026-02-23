"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";

export type DateFilter =
  | "all"
  | "today"
  | "this-week"
  | "this-month"
  | "past";
export type TagFilter = "all" | "free" | "paid" | "online" | "in-person";

interface Club {
  id: string;
  first_name: string;
  avatar_url: string | null;
}

const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://connect3.app";

const CLUBS_PAGE_SIZE = 20;

function useInfiniteClubs(searchQuery: string) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const fetchClubs = useCallback(
    async (cursorVal: string | null, reset: boolean) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(CLUBS_PAGE_SIZE));
        if (cursorVal) params.set("cursor", cursorVal);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const res = await fetch(`${baseUrl}/api/clubs?${params.toString()}`);
        const data = await res.json();
        const newItems: Club[] = data.items ?? [];
        const newCursor: string | null = data.cursor ?? null;

        setClubs((prev) => (reset ? newItems : [...prev, ...newItems]));
        setCursor(newCursor);
        setHasMore(newCursor !== null);
        setInitialLoaded(true);
      } catch {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery],
  );

  // Reset and fetch when search changes
  useEffect(() => {
    setClubs([]);
    setCursor(null);
    setHasMore(true);
    fetchClubs(null, true);
  }, [fetchClubs]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchClubs(cursor, false);
    }
  }, [isLoading, hasMore, cursor, fetchClubs]);

  return { clubs, isLoading, hasMore, loadMore, initialLoaded };
}

interface EventGridFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  categoryOptions: string[];
  dateFilter: DateFilter;
  setDateFilter: React.Dispatch<React.SetStateAction<DateFilter>>;
  tagFilter: TagFilter;
  setTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>;
  selectedClubs: string[];
  setSelectedClubs: React.Dispatch<React.SetStateAction<string[]>>;
}

const dateLabels: Record<DateFilter, string> = {
  all: "All Upcoming",
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  past: "Past Events",
};

const tagLabels: Record<TagFilter, string> = {
  all: "All Tags",
  free: "Free",
  paid: "Paid",
  online: "Online",
  "in-person": "In-Person",
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
  selectedCategory,
  setSelectedCategory,
  categoryOptions,
  dateFilter,
  setDateFilter,
  tagFilter,
  setTagFilter,
  selectedClubs,
  setSelectedClubs,
}: EventGridFiltersProps) {
  const [clubSearch, setClubSearch] = useState("");
  const [debouncedClubSearch, setDebouncedClubSearch] = useState("");
  const clubListRef = useRef<HTMLDivElement>(null);
  // Persist full Club objects for selected IDs across searches
  const [selectedClubsData, setSelectedClubsData] = useState<Club[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedClubSearch(clubSearch), 300);
    return () => clearTimeout(timer);
  }, [clubSearch]);

  const {
    clubs,
    isLoading: clubsLoading,
    loadMore,
    initialLoaded,
  } = useInfiniteClubs(debouncedClubSearch);

  // Keep selectedClubsData in sync: add newly selected, remove deselected
  useEffect(() => {
    setSelectedClubsData((prev) => {
      const merged = [...prev];
      for (const club of clubs) {
        if (
          selectedClubs.includes(club.id) &&
          !merged.find((c) => c.id === club.id)
        ) {
          merged.push(club);
        }
      }
      return merged.filter((c) => selectedClubs.includes(c.id));
    });
  }, [clubs, selectedClubs]);

  const handleClubScroll = useCallback(() => {
    const el = clubListRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      loadMore();
    }
  }, [loadMore]);

  const handleClubToggle = (clubId: string) => {
    setSelectedClubs((prev) =>
      prev.includes(clubId)
        ? prev.filter((id) => id !== clubId)
        : [...prev, clubId],
    );
  };

  return (
    <div className="flex items-center gap-3 w-max">
      {/* Search Inputs */}
      <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm flex-shrink-0 min-w-[200px] md:min-w-[300px] max-w-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search event ..."
          className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-black placeholder:text-gray-400"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 flex-shrink-0">
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

        {/* Categories dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200">
              {selectedCategory === "All"
                ? "Categories"
                : formatCategory(selectedCategory)}
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

        {/* Clubs multi-select dropdown */}
        <DropdownMenu
          onOpenChange={(open) => {
            if (!open) {
              setClubSearch("");
              setDebouncedClubSearch("");
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200">
              {selectedClubs.length === 0 ? (
                <span className="px-1 py-0.5">Clubs</span>
              ) : (
                <span className="flex items-center gap-1">
                  {/* Stacked avatars — show up to 3 */}
                  <span className="flex items-center" style={{ gap: 0 }}>
                    {selectedClubsData.slice(0, 3).map((club, i) => (
                      <span
                        key={club.id}
                        className="relative inline-flex h-6 w-6 shrink-0 rounded-full border-2 border-white overflow-hidden"
                        style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i }}
                      >
                        {club.avatar_url ? (
                          <Image
                            src={club.avatar_url}
                            alt={club.first_name}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="h-full w-full bg-gray-200 flex items-center justify-center text-[9px] font-semibold text-gray-500">
                            {club.first_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                    ))}
                    {/* Overflow badge */}
                    {selectedClubs.length > 3 && (
                      <span
                        className="relative inline-flex h-6 w-6 shrink-0 rounded-full border-2 border-white bg-gray-100 items-center justify-center text-[9px] font-semibold text-gray-500"
                        style={{ marginLeft: -6, zIndex: 0 }}
                      >
                        +{selectedClubs.length - 3}
                      </span>
                    )}
                  </span>
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl shadow-xl p-0"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <input
                type="text"
                placeholder="Search clubs..."
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
              />
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
            </div>

            <div
              ref={clubListRef}
              onScroll={handleClubScroll}
              className="max-h-52 overflow-y-auto py-1 scrollbar-hide"
            >
              {/* Selected clubs pinned at top */}
              {selectedClubsData.map((club) => (
                <DropdownMenuCheckboxItem
                  key={`sel-${club.id}`}
                  checked
                  onCheckedChange={() => handleClubToggle(club.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="flex items-center gap-2">
                    {club.avatar_url ? (
                      <Image
                        src={club.avatar_url}
                        alt={club.first_name}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-gray-500">
                          {club.first_name.charAt(0).toUpperCase()}
                        </span>
                      </span>
                    )}
                    <span className="truncate font-medium">
                      {club.first_name}
                    </span>
                  </span>
                </DropdownMenuCheckboxItem>
              ))}

              {/* Divider between selected and unselected */}
              {selectedClubsData.length > 0 && (
                <DropdownMenuSeparator className="my-1" />
              )}

              {/* Unselected clubs from search */}
              {initialLoaded &&
                clubs.filter((c) => !selectedClubs.includes(c.id)).length ===
                  0 &&
                !clubsLoading && (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    {clubs.length === 0
                      ? "No clubs found"
                      : "All results selected"}
                  </div>
                )}
              {clubs
                .filter((club) => !selectedClubs.includes(club.id))
                .map((club) => (
                  <DropdownMenuCheckboxItem
                    key={club.id}
                    checked={false}
                    onCheckedChange={() => handleClubToggle(club.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span className="flex items-center gap-2">
                      {club.avatar_url ? (
                        <Image
                          src={club.avatar_url}
                          alt={club.first_name}
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-medium text-gray-500">
                            {club.first_name.charAt(0).toUpperCase()}
                          </span>
                        </span>
                      )}
                      <span className="truncate">{club.first_name}</span>
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              {clubsLoading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {selectedClubs.length > 0 && (
              <>
                <DropdownMenuSeparator className="m-0" />
                <button
                  type="button"
                  onClick={() => setSelectedClubs([])}
                  className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear All
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Loader2, Check } from "lucide-react";
import type { DateFilter, TagFilter } from "@/components/events/EventGridFilters";

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

interface MobileEventFiltersProps {
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

export default function MobileEventFilters({
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
}: MobileEventFiltersProps) {
  const [open, setOpen] = useState(false);
  const [clubSearch, setClubSearch] = useState("");
  const [debouncedClubSearch, setDebouncedClubSearch] = useState("");
  const clubListRef = useRef<HTMLDivElement>(null);
  const [selectedClubsData, setSelectedClubsData] = useState<Club[]>([]);
  const [showClubs, setShowClubs] = useState(false);

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

  const activeFilterCount =
    (dateFilter !== "all" ? 1 : 0) +
    (tagFilter !== "all" ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedClubs.length > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm flex-1">
        <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-black placeholder:text-gray-400"
        />
      </div>

      <Sheet open={open} onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setShowClubs(false);
          setClubSearch("");
          setDebouncedClubSearch("");
        }
      }}>
        <SheetTrigger asChild>
          <button className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl max-h-[80dvh] overflow-hidden flex flex-col p-0 bg-white">
          {/* Drag handle for swipe-to-dismiss */}
          <div
            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={(e) => {
              const el = e.currentTarget.closest("[data-slot='sheet-content']") as HTMLElement | null;
              if (!el) return;
              const startY = e.clientY;
              const height = el.getBoundingClientRect().height;
              el.style.transition = "none";

              const onMove = (ev: PointerEvent) => {
                const dy = Math.max(0, ev.clientY - startY);
                el.style.transform = `translateY(${dy}px)`;
              };

              const onUp = (ev: PointerEvent) => {
                const dy = ev.clientY - startY;
                if (dy > height * 0.3) {
                  el.style.transition = "transform 0.25s ease";
                  el.style.transform = `translateY(100%)`;
                  setTimeout(() => {
                    el.style.animation = "none";
                    setOpen(false);
                    requestAnimationFrame(() => {
                      el.style.transform = "";
                      el.style.transition = "";
                      el.style.animation = "";
                    });
                  }, 250);
                } else {
                  el.style.transition = "transform 0.25s ease";
                  el.style.transform = "";
                  setTimeout(() => { el.style.transition = ""; }, 250);
                }
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
              };

              document.addEventListener("pointermove", onMove);
              document.addEventListener("pointerup", onUp);
            }}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <SheetHeader className="px-5 pb-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">Filters</SheetTitle>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setDateFilter("all");
                    setTagFilter("all");
                    setSelectedCategory("All");
                    setSelectedClubs([]);
                  }}
                  className="text-sm text-purple-500 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {!showClubs ? (
              <>
                {/* Date filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">When</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(dateLabels) as DateFilter[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setDateFilter(key)}
                        className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                          key === dateFilter
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {dateLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(tagLabels) as TagFilter[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setTagFilter(key)}
                        className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                          key === tagFilter
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {tagLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                          cat === selectedCategory
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {cat === "All" ? "All Categories" : formatCategory(cat)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clubs - tap to expand */}
                <div>
                  <button
                    onClick={() => setShowClubs(true)}
                    className="flex items-center justify-between w-full"
                  >
                    <h3 className="text-sm font-semibold text-gray-900">
                      Clubs
                      {selectedClubs.length > 0 && (
                        <span className="ml-2 text-purple-500 font-normal">
                          ({selectedClubs.length} selected)
                        </span>
                      )}
                    </h3>
                    <span className="text-gray-400 text-sm">→</span>
                  </button>
                  {selectedClubsData.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedClubsData.map((club) => (
                        <span
                          key={club.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium"
                        >
                          {club.avatar_url ? (
                            <Image
                              src={club.avatar_url}
                              alt={club.first_name}
                              width={16}
                              height={16}
                              className="h-4 w-4 rounded-full object-cover"
                            />
                          ) : (
                            <span className="h-4 w-4 rounded-full bg-purple-200 flex items-center justify-center text-[8px] font-bold">
                              {club.first_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          {club.first_name}
                          <button onClick={(e) => { e.stopPropagation(); handleClubToggle(club.id); }}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Clubs sub-page */
              <div className="flex flex-col h-full -my-4">
                <button
                  onClick={() => { setShowClubs(false); setClubSearch(""); setDebouncedClubSearch(""); }}
                  className="text-sm text-purple-500 font-medium mb-3 self-start"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-2 mb-3">
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
                <div
                  ref={clubListRef}
                  onScroll={handleClubScroll}
                  className="flex-1 overflow-y-auto space-y-1"
                >
                  {clubs.map((club) => (
                    <button
                      key={club.id}
                      onClick={() => handleClubToggle(club.id)}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {club.avatar_url ? (
                        <Image
                          src={club.avatar_url}
                          alt={club.first_name}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-gray-500">
                            {club.first_name.charAt(0).toUpperCase()}
                          </span>
                        </span>
                      )}
                      <span className="flex-1 text-sm text-left truncate">{club.first_name}</span>
                      {selectedClubs.includes(club.id) && (
                        <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      )}
                    </button>
                  ))}
                  {clubsLoading && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {initialLoaded && clubs.length === 0 && !clubsLoading && (
                    <p className="text-sm text-gray-400 text-center py-3">No clubs found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2.5 bg-purple-500 text-white rounded-full text-sm font-semibold hover:bg-purple-600 transition-colors"
            >
              Show results
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

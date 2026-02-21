"use client";
import EventsHeroSection from "@/components/events/EventsHeroSection";
import EventGridFilters, {
  type DateFilter,
  type TagFilter,
} from "@/components/events/EventGridFilters";
import { EventGridCard, EventGridCardSkeleton } from "@/components/events/EventGridCard";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { type Event } from "@/lib/schemas/events/event";
import { toast } from "sonner";
import useSWR from "swr";
import usePaginatedEvents from "@/hooks/usePaginatedEvents";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const CATEGORY_OPTIONS = [
  "All", "competition", "fun", "miscellaneous", "networking", "panel", "study", "workshop",
];

const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://connect3.app";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

function setPageParam(page: number) {
  const url = new URL(window.location.href);
  if (page <= 1) {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", String(page));
  }
  window.history.replaceState({}, "", url);
}

export default function DesktopLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [tagFilter, setTagFilter] = useState<TagFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? Math.max(1, parseInt(p)) : 1;
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (dateFilter !== "all") params.dateFilter = dateFilter;
    if (tagFilter !== "all") params.tagFilter = tagFilter;
    return params;
  }, [debouncedSearch, selectedCategory, dateFilter, tagFilter]);

  // Reset to page 1 when filters actually change
  const filterKey = `${debouncedSearch}|${selectedCategory}|${dateFilter}|${tagFilter}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    setCurrentPage(1);
    setPageParam(1);
  }, [filterKey]);

  const {
    events,
    totalCount,
    totalPages,
    error,
    isLoading,
  } = usePaginatedEvents({ page: currentPage, queryParams });

  const { data: thisWeekData, isLoading: isLoadingThisWeek } = useSWR<{ items: Event[] }>(
    `${baseUrl}/api/events?dateFilter=this-month&limit=10`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const thisWeekEvents = thisWeekData?.items ?? [];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEvent(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (error) {
    toast.error("Could not get events");
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPageParam(page);
    eventListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        ref={eventListRef}
        className="overflow-y-auto scrollbar-hide transition-all duration-300 flex-1"
      >
        <div className="max-w-7xl mx-auto p-4 space-y-8 bg-white z-30">
          <EventsHeroSection events={thisWeekEvents} isLoading={isLoadingThisWeek} onEventClick={setSelectedEvent} />

          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-black">All Events</h2>

            <EventGridFilters
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryOptions={CATEGORY_OPTIONS}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
            />

            <p className="text-sm text-gray-400">
              Viewing {events.length} of {totalCount} results
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <EventGridCardSkeleton key={i} />)
                : events.map((event, index) => (
                    <EventGridCard
                      key={`${event.id}-${index}`}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                    />
                  ))}
            </div>

            {!isLoading && events.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No events found.
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="sticky bottom-0 bg-white py-4 border-t">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-disabled={currentPage <= 1}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {pageNumbers.map((pageNum, i) =>
                    pageNum === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={pageNum === currentPage}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-disabled={currentPage >= totalPages}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
              <div className="relative h-full overflow-y-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors rounded-full shadow-sm"
                >
                  ✕
                </button>
                <EventDetailPanel event={selectedEvent} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

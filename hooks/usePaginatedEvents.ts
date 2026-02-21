import { useMemo } from "react";
import useSWR from "swr";
import { type Event } from "@/lib/schemas/events/event";

interface PaginatedResponse {
  items: Event[];
  totalCount: number;
  page: number;
  totalPages: number;
}

interface UsePaginatedEventsOptions {
  page: number;
  limit?: number;
  queryParams?: Record<string, string>;
}

const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://connect3.app";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function usePaginatedEvents(options: UsePaginatedEventsOptions) {
  const { page, limit = 18, queryParams } = options;

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.set(key, value);
        }
      });
    }

    return `${baseUrl}/api/events?${params.toString()}`;
  }, [page, limit, queryParams]);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<PaginatedResponse>(url, fetcher, {
      revalidateOnFocus: false,
      keepPreviousData: true,
    });

  return {
    events: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    page: data?.page ?? page,
    totalPages: data?.totalPages ?? 0,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

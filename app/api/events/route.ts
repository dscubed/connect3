import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { type Event } from "@/lib/schemas/events/event";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

/**
 * Transform database event row (with event_ticket_tiers + event_locations)
 * to the Event type used by the frontend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDbEvent(dbEvent: any): Event {
  // Derive min/max from ticket tiers (empty tiers = free)
  const tiers: { price: number }[] = dbEvent.event_ticket_tiers ?? [];
  const prices = tiers.map((t) => t.price);
  const pricingMin = prices.length > 0 ? Math.min(...prices) : 0;
  const pricingMax = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    id: dbEvent.id,
    name: dbEvent.name,
    creatorProfileId: dbEvent.creator_profile_id,
    description: dbEvent.description ?? undefined,
    start: dbEvent.start,
    end: dbEvent.end ?? undefined,
    publishedAt: dbEvent.published_at ?? dbEvent.created_at ?? new Date().toISOString(),
    isOnline: dbEvent.is_online,
    thumbnail: dbEvent.thumbnail ?? undefined,
    category: dbEvent.category ?? undefined,
    location: {
      venue: dbEvent.event_locations?.venue ?? "TBA",
      address: dbEvent.event_locations?.address ?? "",
      latitude: dbEvent.event_locations?.latitude ?? 0,
      longitude: dbEvent.event_locations?.longitude ?? 0,
    },
    pricing: { min: pricingMin, max: pricingMax },
    source: dbEvent.source ?? undefined,
  };
}

/**
 * Build common filters for event queries.
 * Only published events are ever returned.
 */
function applyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  params: {
    search: string | null;
    category: string | null;
    dateFilter: string | null;
    tagFilter: string | null;
    clubs: string | null;
  },
) {
  // Always restrict to published events
  query = query.eq("status", "published");

  if (params.search?.trim()) {
    query = query.ilike("name", `%${params.search.trim()}%`);
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const now = new Date();
  if (params.dateFilter === "past") {
    query = query.lt("start", now.toISOString());
  } else {
    query = query.gte("start", now.toISOString());
    if (params.dateFilter === "today") {
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      query = query.lt("start", dayEnd.toISOString());
    } else if (params.dateFilter === "this-week") {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - now.getDay() + 7);
      weekEnd.setHours(0, 0, 0, 0);
      query = query.lt("start", weekEnd.toISOString());
    } else if (params.dateFilter === "this-month") {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      query = query.lt("start", monthEnd.toISOString());
    }
  }

  if (params.clubs) {
    const clubIds = params.clubs.split(",").filter(Boolean);
    if (clubIds.length > 0) {
      query = query.in("creator_profile_id", clubIds);
    }
  }

  if (params.tagFilter === "online") {
    query = query.eq("is_online", true);
  } else if (params.tagFilter === "in-person") {
    query = query.eq("is_online", false);
  }

  return query;
}

/** True if any ticket tier has a non-zero price. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPaidEvent(dbEvent: any): boolean {
  const tiers: { price: number }[] = dbEvent.event_ticket_tiers ?? [];
  return tiers.some((t) => t.price > 0);
}

const EVENT_SELECT = `
  id, name, creator_profile_id, description, start, end,
  published_at, created_at, is_online, thumbnail, category, source, status,
  event_ticket_tiers (price),
  event_locations (venue, address, latitude, longitude)
`;

/**
 * Paginated retrieval of published events. Supports both:
 * - Offset pagination: ?page=1&limit=18 (returns items + totalCount)
 * - Cursor pagination: ?cursor=xxx&limit=18 (returns items + cursor)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const page = searchParams.get("page");
  const limit = parseInt(searchParams.get("limit") || "18");
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const dateFilter = searchParams.get("dateFilter");
  const tagFilter = searchParams.get("tagFilter");
  const clubs = searchParams.get("clubs");

  const filterParams = { search, category, dateFilter, tagFilter, clubs };
  const needsPostFilter = tagFilter === "free" || tagFilter === "paid";
  const isPast = dateFilter === "past";
  const sortAscending = !isPast;

  try {
    if (page !== null) {
      const pageNum = Math.max(1, parseInt(page));
      const from = (pageNum - 1) * limit;

      if (needsPostFilter) {
        let allQuery = supabase
          .from("events")
          .select(EVENT_SELECT)
          .order("start", { ascending: sortAscending, nullsFirst: false })
          .order("created_at", { ascending: sortAscending });

        allQuery = applyFilters(allQuery, filterParams);
        const { data, error } = await allQuery;

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let filtered: any[] = data ?? [];
        if (tagFilter === "free") filtered = filtered.filter((e) => !isPaidEvent(e));
        else if (tagFilter === "paid") filtered = filtered.filter(isPaidEvent);

        const totalCount = filtered.length;
        const pageItems = filtered.slice(from, from + limit);
        return NextResponse.json({
          items: pageItems.map(transformDbEvent),
          totalCount,
          page: pageNum,
          totalPages: Math.ceil(totalCount / limit),
        });
      }

      let query = supabase
        .from("events")
        .select(EVENT_SELECT, { count: "exact" })
        .order("start", { ascending: sortAscending, nullsFirst: false })
        .order("created_at", { ascending: sortAscending })
        .range(from, from + limit - 1);

      query = applyFilters(query, filterParams);
      const { data, error, count } = await query;

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        items: (data ?? []).map(transformDbEvent),
        totalCount: count ?? 0,
        page: pageNum,
        totalPages: Math.ceil((count ?? 0) / limit),
      });
    }

    // ── Cursor-based pagination ──
    let query = supabase
      .from("events")
      .select(EVENT_SELECT)
      .order("start", { ascending: sortAscending, nullsFirst: false })
      .order("created_at", { ascending: sortAscending });

    query = applyFilters(query, filterParams);

    if (cursor) {
      if (cursor.startsWith("null:")) {
        const createdAtCursor = cursor.slice(5);
        query = sortAscending
          ? query.is("start", null).gt("created_at", createdAtCursor)
          : query.is("start", null).lt("created_at", createdAtCursor);
      } else {
        query = sortAscending
          ? query.or(`start.gt.${cursor},start.is.null`)
          : query.or(`start.lt.${cursor},start.is.null`);
      }
    }

    const fetchSize = needsPostFilter ? limit * 3 : limit;
    query = query.limit(fetchSize + 1);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const dbHasMore = (data?.length ?? 0) > fetchSize;
    const batch = (data ?? []).slice(0, fetchSize);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filtered: any[] = batch;
    if (tagFilter === "free") filtered = batch.filter((e) => !isPaidEvent(e));
    else if (tagFilter === "paid") filtered = batch.filter(isPaidEvent);

    const morePagesExist = needsPostFilter
      ? filtered.length > limit || dbHasMore
      : (data?.length ?? 0) > limit;

    const events = filtered.slice(0, limit);

    let newCursor: string | null = null;
    if (morePagesExist) {
      const cursorRow = needsPostFilter
        ? (filtered.length > limit ? filtered[limit - 1] : batch[batch.length - 1])
        : data![limit - 1];
      newCursor = cursorRow.start ? cursorRow.start : `null:${cursorRow.created_at}`;
    }

    return NextResponse.json({ items: events.map(transformDbEvent), cursor: newCursor });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

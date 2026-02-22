import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { type Event } from "@/lib/schemas/events/event";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

/**
 * Transform database event record to match our event schema
 * This should match the database schema but double check
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDbEventToEventSchema(dbEvent: any): Event {
  // Map the database fields to the schema fields
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    creatorProfileId: dbEvent.creator_profile_id,
    description: dbEvent.description,
    bookingUrl: dbEvent.booking_url,
    start: dbEvent.start,
    end: dbEvent.end,
    publishedAt: dbEvent.created_at || new Date().toISOString(),
    isOnline: dbEvent.is_online,
    capacity: dbEvent.capacity,
    currency: dbEvent.currency,
    thumbnail: dbEvent.thumbnail,
    category: dbEvent.category,
    location: {
      venue: dbEvent.event_locations?.venue || "TBA",
      address: dbEvent.event_locations?.address || "TBA",
      latitude: dbEvent.event_locations?.latitude || 0,
      longitude: dbEvent.event_locations?.longitude || 0,
      city: dbEvent.event_locations?.city || "TBA",
      country: dbEvent.event_locations?.country || "TBA",
    },
    pricing: {
      min: dbEvent.event_pricings?.min ?? 0,
      max: dbEvent.event_pricings?.max ?? 0,
    },
  };
}

/**
 * Build common filters for event queries.
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
  if (params.search && params.search.trim()) {
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
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dayEnd.setDate(dayEnd.getDate() + 1);
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

/**
 * Paginated retrieval of events. Supports both:
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
          .select(
            `*, event_pricings (min, max), event_locations (venue, address, latitude, longitude, city, country)`,
          )
          .order("start", { ascending: sortAscending, nullsFirst: false })
          .order("created_at", { ascending: sortAscending });

        allQuery = applyFilters(allQuery, filterParams);
        const { data, error } = await allQuery;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let filtered: any[] = data;
        if (tagFilter === "free") {
          filtered = data.filter((e) => {
            const min = e.event_pricings?.min ?? 0;
            const max = e.event_pricings?.max ?? 0;
            return min <= 0 && max <= 0;
          });
        } else if (tagFilter === "paid") {
          filtered = data.filter((e) => {
            const min = e.event_pricings?.min ?? 0;
            const max = e.event_pricings?.max ?? 0;
            return min > 0 || max > 0;
          });
        }

        const totalCount = filtered.length;
        const pageItems = filtered.slice(from, from + limit);
        const typedEvents: Event[] = pageItems.map(transformDbEventToEventSchema);

        return NextResponse.json({
          items: typedEvents,
          totalCount,
          page: pageNum,
          totalPages: Math.ceil(totalCount / limit),
        });
      }

      // Standard offset pagination with exact count
      let query = supabase
        .from("events")
        .select(
          `*, event_pricings (min, max), event_locations (venue, address, latitude, longitude, city, country)`,
          { count: "exact" },
        )
        .order("start", { ascending: sortAscending, nullsFirst: false })
        .order("created_at", { ascending: sortAscending })
        .range(from, from + limit - 1);

      query = applyFilters(query, filterParams);
      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const typedEvents: Event[] = (data ?? []).map(transformDbEventToEventSchema);
      const totalCount = count ?? 0;

      return NextResponse.json({
        items: typedEvents,
        totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limit),
      });
    }

    // ── Cursor-based pagination (legacy / infinite scroll) ──
    let query = supabase
      .from("events")
      .select(
        `
        *,
        event_pricings (
          min,
          max
        ),
        event_locations (
          venue,
          address,
          latitude,
          longitude,
          city,
          country
        )
      `,
      )
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const dbHasMore = data.length > fetchSize;
    const batch = data.slice(0, fetchSize);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filtered: any[] = batch;
    if (tagFilter === "free") {
      filtered = batch.filter((e) => {
        const min = e.event_pricings?.min ?? 0;
        const max = e.event_pricings?.max ?? 0;
        return min <= 0 && max <= 0;
      });
    } else if (tagFilter === "paid") {
      filtered = batch.filter((e) => {
        const min = e.event_pricings?.min ?? 0;
        const max = e.event_pricings?.max ?? 0;
        return min > 0 || max > 0;
      });
    }

    const morePagesExist = needsPostFilter
      ? filtered.length > limit || dbHasMore
      : data.length > limit;

    const events = filtered.slice(0, limit);
    const typedEvents: Event[] = events.map(transformDbEventToEventSchema);

    let newCursor: string | null = null;
    if (morePagesExist) {
      const cursorRow = needsPostFilter
        ? (filtered.length > limit ? filtered[limit - 1] : batch[batch.length - 1])
        : data[limit - 1];
      newCursor = cursorRow.start
        ? cursorRow.start
        : `null:${cursorRow.created_at}`;
    }

    return NextResponse.json({ items: typedEvents, cursor: newCursor });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

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
 * Cursor based paginated retrieval of many events with server-side filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "18");
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const dateFilter = searchParams.get("dateFilter");
  const tagFilter = searchParams.get("tagFilter");

  try {
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
      .eq("is_attendable", true)
      .order("start", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      if (dateFilter === "today") {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        query = query.gte("start", dayStart.toISOString()).lt("start", dayEnd.toISOString());
      } else if (dateFilter === "this-week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        query = query.gte("start", weekStart.toISOString()).lt("start", weekEnd.toISOString());
      } else if (dateFilter === "this-month") {
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = query.gte("start", now.toISOString()).lt("start", monthEnd.toISOString());
      } else if (dateFilter === "upcoming") {
        query = query.gte("start", now.toISOString());
      }
    }

    if (tagFilter === "online") {
      query = query.eq("is_online", true);
    } else if (tagFilter === "in-person") {
      query = query.eq("is_online", false);
    }

    if (cursor) {
      if (cursor.startsWith("null:")) {
        const createdAtCursor = cursor.slice(5);
        query = query.is("start", null).lt("created_at", createdAtCursor);
      } else {
        query = query.or(`start.lt.${cursor},start.is.null`);
      }
    }

    // Pricing filters (free/paid) can't be cleanly expressed in PostgREST
    // because "free" includes events with no pricing record. Over-fetch and
    // filter in JS so cursor pagination stays correct.
    const needsPostFilter = tagFilter === "free" || tagFilter === "paid";
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

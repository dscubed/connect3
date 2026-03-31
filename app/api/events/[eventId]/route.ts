import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createEventBodySchema } from "@/lib/schemas/api/events";
import { type Event } from "@/lib/schemas/events/event";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

/**
 * Transform database event record to match our event schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDbEventToEventSchema(dbEvent: any): Event {
  const tiers: { price: number }[] = dbEvent.event_ticket_tiers ?? [];
  const prices = tiers.map((t) => t.price);
  const images: { url: string; sort_order: number }[] = (
    dbEvent.event_images ?? []
  ).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order,
  );
  const venues: {
    type: string;
    venue: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    sort_order: number;
  }[] = (dbEvent.event_venues ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order,
  );
  const primaryVenue = venues.find((v) => v.type !== "tba") ?? venues[0];
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    creatorProfileId: dbEvent.creator_profile_id,
    description: dbEvent.description ?? undefined,
    start: dbEvent.start,
    end: dbEvent.end ?? undefined,
    publishedAt:
      dbEvent.published_at ?? dbEvent.created_at ?? new Date().toISOString(),
    isOnline:
      typeof dbEvent.is_online === "boolean"
        ? dbEvent.is_online
        : dbEvent.location_type === "online",
    thumbnail: images[0]?.url ?? undefined,
    category: dbEvent.category ?? undefined,
    location: {
      venue: primaryVenue?.venue ?? "TBA",
      address: primaryVenue?.address ?? "",
      latitude: primaryVenue?.latitude ?? 0,
      longitude: primaryVenue?.longitude ?? 0,
    },
    pricing: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
    source: dbEvent.source ?? undefined,
  };
}

interface RouteParameters {
  params: Promise<{ eventId: string }>;
}

/**
 * Retrieve a single event by its id
 * @param request
 * @param param1
 * @returns
 */
export async function GET(request: NextRequest, { params }: RouteParameters) {
  const { eventId } = await params;
  try {
    const { data: dbEvent, error } = await supabase
      .from("events")
      .select(
        "*, event_venues(type, venue, address, latitude, longitude, sort_order), event_images(url, sort_order), event_ticket_tiers(price)",
      )
      .eq("id", eventId)
      .single();

    if (error || !dbEvent) {
      return NextResponse.json(
        { error: error?.message || "Event not found" },
        { status: error ? 500 : 404 },
      );
    }

    const event = transformDbEventToEventSchema(dbEvent);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParameters) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) {
    console.error("Unauthenticated");
    return authResult;
  }

  const { eventId } = await params;
  const body = await request.json();

  // Validate the body against the schema, but adjust for the event ID from the URL
  const validatedBody = createEventBodySchema.parse({
    ...body,
    id: eventId, // Use the event ID from the URL parameter
  });

  const {
    id,
    name,
    start,
    end,
    description,
    type,
    creator_profile_id,
    collaborators,
    location_type,
    thumbnailUrl,
    location,
    university,
    source,
  } = validatedBody;

  // events.category is text null; we store first selected category
  const category = type?.[0] ?? null;
  const isOnline = location_type === "virtual";
  const publishedAt = new Date().toISOString();
  const hasLocation =
    location &&
    [location.venue, location.address, location.city, location.country].some(
      (value) => Boolean(value && value.trim()),
    );

  console.log("Inserting document");
  try {
    // Insert the event into the events table
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        id,
        name: name || null,
        start,
        end,
        description: description || null,
        creator_profile_id,
        category,
        is_online: isOnline,
        published_at: publishedAt,
        source: source ?? null,
        university: university && university.length > 0 ? university : null,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Failed to insert event");
      console.error(eventError.message);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (hasLocation && location?.venue) {
      await supabase.from("event_venues").insert({
        event_id: id,
        type: isOnline ? "online" : "physical",
        venue: location.venue ?? null,
        address: location.address ?? null,
        sort_order: 0,
      });
    } else if (thumbnailUrl) {
      // Insert thumbnail as first image if no location but thumbnail provided
      await supabase.from("event_images").insert({
        event_id: id,
        url: thumbnailUrl,
        sort_order: 0,
      });
    }

    // Insert collaborators if provided
    if (collaborators && collaborators.length > 0) {
      const collaboratorInserts = collaborators.map((collaboratorId) => ({
        event_id: id,
        profile_id: collaboratorId,
      }));

      const { error: collabError } = await supabase
        .from("event_collaborators")
        .insert(collaboratorInserts);

      if (collabError) {
        // Rollback: remove the event if collaborators insertion fails
        console.error("Error inserting collaborators:", collabError);
        await supabase.from("events").delete().eq("id", id);
        return NextResponse.json(
          { error: "Failed to add collaborators" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.log("Problem ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParameters) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { eventId } = await params;
  const body = await request.json();

  const validatedBody = createEventBodySchema.parse({
    ...body,
    id: eventId,
  });

  const { name, start, end, description, type, location_type, location } =
    validatedBody;

  try {
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("creator_profile_id, location_id")
      .eq("id", eventId)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: fetchError?.message || "Event not found" },
        { status: fetchError ? 500 : 404 },
      );
    }

    if (existingEvent.creator_profile_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this event" },
        { status: 403 },
      );
    }

    // events.category is text null; we store first selected category
    const category = type?.[0] ?? null;
    const isOnline = location_type === "virtual";
    const hasLocation =
      location &&
      [location.venue, location.address, location.city, location.country].some(
        (value) => Boolean(value && value.trim()),
      );

    const { error: updateError } = await supabase
      .from("events")
      .update({
        name: name || null,
        start,
        end,
        description: description || null,
        category,
        is_online: isOnline,
      })
      .eq("id", eventId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (hasLocation && location?.venue) {
      // Upsert into event_venues (delete existing first, then insert)
      await supabase.from("event_venues").delete().eq("event_id", eventId);
      await supabase.from("event_venues").insert({
        event_id: eventId,
        type: isOnline ? "online" : "physical",
        venue: location.venue ?? null,
        address: location.address ?? null,
        sort_order: 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParameters,
) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { eventId } = await params;

  try {
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("creator_profile_id, location_id")
      .eq("id", eventId)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: fetchError?.message || "Event not found" },
        { status: fetchError ? 500 : 404 },
      );
    }

    if (existingEvent.creator_profile_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this event" },
        { status: 403 },
      );
    }

    await supabase.from("event_collaborators").delete().eq("event_id", eventId);

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createEventBodySchema } from "@/lib/schemas/api/events";
import { type Event } from "@/lib/schemas/events/event";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const deleteVectorStoreFile = async (fileId: string) => {
    const vectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID;
    if (!vectorStoreId) {
        throw new Error(
            "Events Vector Store ID not configured in environment variables"
        );
    }

    try {
        await openai.vectorStores.files.delete(fileId, {
            vector_store_id: vectorStoreId,
        });
    } catch (error) {
        console.error("Failed to delete vector store file:", error);
    }

    try {
        await openai.files.delete(fileId);
    } catch (error) {
        console.error("Failed to delete OpenAI file:", error);
    }
};

/**
 * Transform database event record to match our event schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDbEventToEventSchema(dbEvent: any): Event {
    const fallbackCategory = dbEvent.category || "general";
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    creatorProfileId: dbEvent.creator_profile_id,
    description: dbEvent.description,
    bookingUrl: dbEvent.booking_url,
    start: dbEvent.start,
    end: dbEvent.end,
    publishedAt: dbEvent.created_at || new Date().toISOString(),
    isOnline:
      typeof dbEvent.is_online === "boolean"
        ? dbEvent.is_online
        : dbEvent.location_type === "online",
    capacity: dbEvent.capacity || 50,
    currency: dbEvent.currency || "USD",
    thumbnail: dbEvent.thumbnail,
    category: dbEvent.event_categories?.category || fallbackCategory,
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
            .select("*")
            .eq("id", eventId)
            .single();

        if (error || !dbEvent) {
            return NextResponse.json(
                { error: error?.message || "Event not found" },
                { status: error ? 500 : 404 }
            );
        }

        let location = null;
        if (dbEvent.location_id) {
            const { data: locationData } = await supabase
                .from("event_locations")
                .select("venue, address, latitude, longitude, city, country")
                .eq("id", dbEvent.location_id)
                .single();
            location = locationData ?? null;
        }

        let pricing = null;
        if (dbEvent.pricing_id) {
            const { data: pricingData } = await supabase
                .from("event_pricings")
                .select("min, max")
                .eq("id", dbEvent.pricing_id)
                .single();
            pricing = pricingData ?? null;
        }

        const dbEventWithRelations = {
            ...dbEvent,
            event_locations: location,
            event_pricings: pricing,
        };

        const event = transformDbEventToEventSchema(dbEventWithRelations);
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
        id: eventId // Use the event ID from the URL parameter
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
        booking_link,
        location_type,
        thumbnailUrl,
        pricing_min,
        pricing_max,
        currency,
        location,
        university,
        source,
    } = validatedBody;

    const bookingUrl = booking_link?.[0] ?? null;
    const category = type?.[0] ?? null;
    const isOnline = location_type === "virtual";
    const publishedAt = new Date().toISOString();
    const normalizedPricingMin =
        typeof pricing_min === "number" && Number.isFinite(pricing_min)
            ? pricing_min
            : 0;
    const normalizedPricingMax =
        typeof pricing_max === "number" && Number.isFinite(pricing_max)
            ? pricing_max
            : normalizedPricingMin;
    const boundedPricingMax = Math.max(normalizedPricingMin, normalizedPricingMax);
    const hasLocation =
        location &&
        [location.venue, location.address, location.city, location.country].some(
            (value) => Boolean(value && value.trim())
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
                booking_url: bookingUrl,
                category,
                is_online: isOnline,
                published_at: publishedAt,
                thumbnail: thumbnailUrl ?? null,
                currency: currency ?? null,
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

        let locationId: string | null = null;
        if (hasLocation) {
            const { data: locationData, error: locationError } = await supabase
                .from("event_locations")
                .insert({
                    venue: location?.venue ?? null,
                    address: location?.address ?? null,
                    city: location?.city ?? null,
                    country: location?.country ?? null,
                })
                .select("id")
                .single();

            if (locationError) {
                console.error("Error inserting location:", locationError);
                await supabase.from("events").delete().eq("id", id);
                return NextResponse.json(
                    { error: "Failed to add location" },
                    { status: 500 }
                );
            }

            locationId = locationData?.id ?? null;
        }

        let pricingId: string | null = null;
        const { data: pricingData, error: pricingError } = await supabase
            .from("event_pricings")
            .insert({
                min: normalizedPricingMin,
                max: boundedPricingMax,
            })
            .select("id")
            .single();

        if (pricingError) {
            console.error("Error inserting pricing:", pricingError);
            await supabase.from("events").delete().eq("id", id);
            return NextResponse.json(
                { error: "Failed to add pricing" },
                { status: 500 }
            );
        }

        pricingId = pricingData?.id ?? null;

        if (locationId || pricingId) {
            const { error: updateError } = await supabase
                .from("events")
                .update({
                    location_id: locationId,
                    pricing_id: pricingId,
                })
                .eq("id", id);

            if (updateError) {
                console.error("Error updating event links:", updateError);
                return NextResponse.json(
                    { error: "Failed to finalize event" },
                    { status: 500 }
                );
            }
        }

        // Insert collaborators if provided
        if (collaborators && collaborators.length > 0) {
            const collaboratorInserts = collaborators.map(collaboratorId => ({
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
                return NextResponse.json({ error: "Failed to add collaborators" }, { status: 500 });
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

    const {
        name,
        start,
        end,
        description,
        type,
        booking_link,
        location_type,
        thumbnailUrl,
        pricing_min,
        pricing_max,
        currency,
        location,
    } = validatedBody;

    try {
        const { data: existingEvent, error: fetchError } = await supabase
            .from("events")
            .select("creator_profile_id, location_id, pricing_id")
            .eq("id", eventId)
            .single();

        if (fetchError || !existingEvent) {
            return NextResponse.json(
                { error: fetchError?.message || "Event not found" },
                { status: fetchError ? 500 : 404 }
            );
        }

        if (existingEvent.creator_profile_id !== user.id) {
            return NextResponse.json(
                { error: "Not authorized to edit this event" },
                { status: 403 }
            );
        }

        const bookingUrl = booking_link?.[0] ?? null;
        const category = type?.[0] ?? null;
        const isOnline = location_type === "virtual";
        const normalizedPricingMin =
            typeof pricing_min === "number" && Number.isFinite(pricing_min)
                ? pricing_min
                : 0;
        const normalizedPricingMax =
            typeof pricing_max === "number" && Number.isFinite(pricing_max)
                ? pricing_max
                : normalizedPricingMin;
        const boundedPricingMax = Math.max(normalizedPricingMin, normalizedPricingMax);
        const hasLocation =
            location &&
            [location.venue, location.address, location.city, location.country].some(
                (value) => Boolean(value && value.trim())
            );

        const { error: updateError } = await supabase
            .from("events")
            .update({
                name: name || null,
                start,
                end,
                description: description || null,
                booking_url: bookingUrl,
                category,
                is_online: isOnline,
                thumbnail: thumbnailUrl ?? null,
                currency: currency ?? null,
            })
            .eq("id", eventId);

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        if (hasLocation) {
            if (existingEvent.location_id) {
                const { error: locationUpdateError } = await supabase
                    .from("event_locations")
                    .update({
                        venue: location?.venue ?? null,
                        address: location?.address ?? null,
                        city: location?.city ?? null,
                        country: location?.country ?? null,
                    })
                    .eq("id", existingEvent.location_id);

                if (locationUpdateError) {
                    return NextResponse.json(
                        { error: "Failed to update location" },
                        { status: 500 }
                    );
                }
            } else {
                const { data: locationData, error: locationInsertError } =
                    await supabase
                        .from("event_locations")
                        .insert({
                            venue: location?.venue ?? null,
                            address: location?.address ?? null,
                            city: location?.city ?? null,
                            country: location?.country ?? null,
                        })
                        .select("id")
                        .single();

                if (locationInsertError) {
                    return NextResponse.json(
                        { error: "Failed to add location" },
                        { status: 500 }
                    );
                }

                await supabase
                    .from("events")
                    .update({ location_id: locationData?.id ?? null })
                    .eq("id", eventId);
            }
        } else if (existingEvent.location_id) {
            await supabase
                .from("event_locations")
                .update({
                    venue: null,
                    address: null,
                    city: null,
                    country: null,
                })
                .eq("id", existingEvent.location_id);
        }

        if (existingEvent.pricing_id) {
            const { error: pricingUpdateError } = await supabase
                .from("event_pricings")
                .update({
                    min: normalizedPricingMin,
                    max: boundedPricingMax,
                })
                .eq("id", existingEvent.pricing_id);

            if (pricingUpdateError) {
                return NextResponse.json(
                    { error: "Failed to update pricing" },
                    { status: 500 }
                );
            }
        } else {
            const { data: pricingData, error: pricingInsertError } =
                await supabase
                    .from("event_pricings")
                .insert({
                    min: normalizedPricingMin,
                    max: boundedPricingMax,
                })
                    .select("id")
                    .single();

            if (pricingInsertError) {
                return NextResponse.json(
                    { error: "Failed to add pricing" },
                    { status: 500 }
                );
            }

            await supabase
                .from("events")
                .update({ pricing_id: pricingData?.id ?? null })
                .eq("id", eventId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParameters) {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    const { user } = authResult;
    const { eventId } = await params;

    try {
        const { data: existingEvent, error: fetchError } = await supabase
            .from("events")
            .select("creator_profile_id, location_id, pricing_id, openai_file_id")
            .eq("id", eventId)
            .single();

        if (fetchError || !existingEvent) {
            return NextResponse.json(
                { error: fetchError?.message || "Event not found" },
                { status: fetchError ? 500 : 404 }
            );
        }

        if (existingEvent.creator_profile_id !== user.id) {
            return NextResponse.json(
                { error: "Not authorized to delete this event" },
                { status: 403 }
            );
        }

        if (existingEvent.openai_file_id) {
            await deleteVectorStoreFile(existingEvent.openai_file_id);
        }

        await supabase
            .from("event_collaborators")
            .delete()
            .eq("event_id", eventId);

        const { error: deleteError } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 500 }
            );
        }

        if (existingEvent.location_id) {
            await supabase
                .from("event_locations")
                .delete()
                .eq("id", existingEvent.location_id);
        }

        if (existingEvent.pricing_id) {
            await supabase
                .from("event_pricings")
                .delete()
                .eq("id", existingEvent.pricing_id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

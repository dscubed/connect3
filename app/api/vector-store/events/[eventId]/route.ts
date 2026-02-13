import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createEventBodySchema } from "@/lib/schemas/api/events";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { EventFile, EventFilePricing } from "@/types/events/event";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RouteParameters {
  params: Promise<{ eventId: string }>;
}

const getVectorStoreId = () => {
  const vectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID;
  if (!vectorStoreId) {
    throw new Error(
      "Events Vector Store ID not configured in environment variables",
    );
  }
  return vectorStoreId;
};

const deleteVectorStoreFile = async (fileId: string) => {
  const vectorStoreId = getVectorStoreId();
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

const uploadEventToVectorStore = async ({
  event,
  eventId,
  userId,
}: {
  event: ReturnType<typeof createEventBodySchema.parse>;
  eventId: string;
  userId: string;
}) => {
  const {
    name,
    start,
    end,
    description,
    type,
    pricing,
    city,
    location_type,
    university,
  } = event;

  const creator = await fetchUserDetails(userId);
  if (!creator) {
    throw new Error("Failed to fetch creator details");
  }

  const { data, error: collabError } = await supabase
    .from("event_collaborators")
    .select(
      `
        profiles ( first_name, university )
      `,
    )
    .eq("event_id", eventId);

  if (collabError) {
    console.warn("Failed to fetch collaborators:", collabError);
  }

  const collaboratorRows = collabError ? [] : data ?? [];
  const collaboratorNames = collaboratorRows
    .flatMap((item) => item.profiles)
    .map((profile) => profile.first_name);

  const universities = Array.from(
    new Set([
      ...collaboratorRows
        .flatMap((item) => item.profiles)
        .map((profile) => profile.university)
        .filter((uni): uni is string => typeof uni === "string"),
      ...(creator.university ? [creator.university] : []),
    ]),
  );

  const vectorStoreId = getVectorStoreId();
  const filePricing: EventFilePricing =
    pricing === "free" ? { type: "free" } : { type: "paid" };

  const eventFile: EventFile = {
    id: eventId,
    event_name: name || "Event",
    organisers: {
      creator: creator?.full_name || "Unknown",
      collaborators: collaboratorNames,
    },
    time: {
      start: start.getTime(),
      end: end.getTime(),
    },
    location: {
      city: city || [],
      location_type,
    },
    pricing: filePricing,
    description: description || "",
    type: type || [],
    thumbnail_url: event.thumbnailUrl ?? undefined,
    booking_links: event.booking_link,
    attributes: {
      university: university || [],
      start_time: start.getTime(),
      end_time: end.getTime(),
      pricing: filePricing,
      city: city || [],
    },
    universities: universities,
  };

  const fileContent = createEventFileContent(eventFile);
  const safeName = (name || "event").replace(/\s+/g, "_");
  const fileName = `event_${safeName}.json`;
  const fileObj = new File([fileContent], fileName, {
    type: "text/plain",
  });

  const file = await openai.files.create({
    file: fileObj,
    purpose: "assistants",
  });

  const vectorStoreFile = await openai.vectorStores.files.createAndPoll(
    vectorStoreId,
    {
      file_id: file.id,
    },
  );

  if (vectorStoreFile.status === "failed") {
    throw new Error(
      `Failed to add file to vector store: ${
        vectorStoreFile.last_error?.message || "Unknown error"
      }`,
    );
  }

  if (!file.id) {
    throw new Error("OpenAI did not return a file ID");
  }

  await openai.vectorStores.files.update(file.id, {
    vector_store_id: vectorStoreId,
    attributes: {
      id: eventId,
      event_name: name ?? "Event",
      creator_name: creator?.full_name || "Unknown",
      collaborators: collaboratorNames.join(", "),
      type: (type || []).join(", "),
      start_time: start.getTime(),
      end_time: end.getTime(),
      city: (city || []).join(", "),
      pricing_type: pricing,
      location_type: location_type,
      university: (university || []).join(", "),
    },
  });

  const { error: updateError } = await supabase
    .from("events")
    .update({ openai_file_id: file.id })
    .eq("id", eventId);

  if (updateError) {
    throw new Error("Failed to update event with OpenAI file ID");
  }

  return file.id;
};

/**
 *
 * @param request
 * @returns
 */
export async function POST(request: NextRequest, { params }: RouteParameters) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { user } = authResult;
    const body = await request.json();
    const { eventId } = await params;
    const event = createEventBodySchema.parse({
      ...body,
      id: eventId, // Use the event ID from the URL parameter
    });

    const uploadedFileId = await uploadEventToVectorStore({
      event,
      eventId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      uploadedFileId,
    });
  } catch (error) {
    console.error("Upload process error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParameters) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { eventId } = await params;
    const body = await request.json();
    const event = createEventBodySchema.parse({
      ...body,
      id: eventId,
    });

    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("creator_profile_id, openai_file_id")
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

    if (existingEvent.openai_file_id) {
      await deleteVectorStoreFile(existingEvent.openai_file_id);
    }

    const uploadedFileId = await uploadEventToVectorStore({
      event,
      eventId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      uploadedFileId,
    });
  } catch (error) {
    console.error("Vector store update error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParameters) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { eventId } = await params;

    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("creator_profile_id, openai_file_id")
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

    if (existingEvent.openai_file_id) {
      await deleteVectorStoreFile(existingEvent.openai_file_id);
    }

    await supabase
      .from("events")
      .update({ openai_file_id: null })
      .eq("id", eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vector store delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

function createEventFileContent(eventFile: EventFile): string {
  return `${eventFile.event_name} (${eventFile.type?.join(", ") || "No Type"})
Organisors: ${eventFile.organisers.creator}${
    eventFile.organisers.collaborators.length > 0
      ? " with " + eventFile.organisers.collaborators.join(", ")
      : ""
  }
Time: ${new Date(eventFile.time.start).toLocaleString()} - ${new Date(
    eventFile.time.end,
  ).toLocaleString()}
Location: ${eventFile.location.location_type}${
    eventFile.location.city.length > 0
      ? " in " + eventFile.location.city.join(", ")
      : ""
  }
Pricing: ${eventFile.pricing.type === "free" ? "Free" : "Paid"}
Booking Links: ${
    eventFile.booking_links && eventFile.booking_links.length > 0
      ? eventFile.booking_links.join(", ")
      : "None"
  }

${eventFile.description}`;
}

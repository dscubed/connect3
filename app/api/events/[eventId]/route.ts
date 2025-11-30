import { fetchEvent } from "@/lib/events/fetchEvents";
import { NextRequest, NextResponse } from "next/server";

interface RouteParameters {
    params: Promise<{ eventId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParameters) {
    const { eventId } = await params;
    try {
        const event = await fetchEvent(eventId);
        if (!event) {
            return NextResponse.json({ error: "Could not fetch"})
        }

        return NextResponse.json({ event: event });
    } catch (error) {
        return NextResponse.json({ error: error });
    }
}
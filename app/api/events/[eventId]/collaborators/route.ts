import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface RouteParameters {
    params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParameters) {
    const COLLABORATOR_LIMIT = 5; // enforce on frontend perhaps 

    const { eventId } = await params;
    try {
        const { data, error } = await supabase
            .from("event_collaborators")
            .select(`
                profiles (
                first_name,
                last_name
                )
            `)
            .eq("event_id", eventId)
            .limit(COLLABORATOR_LIMIT)
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const collaborators = data.map(({ profiles }) => ({ ...profiles }));
        return NextResponse.json(collaborators, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }

}
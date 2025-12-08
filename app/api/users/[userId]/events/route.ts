import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface RouteParameters {
    params: Promise<{ userId: string }>;
}


/**
 * Paginated querying for events created by a specific user 
 * @param request 
 */
export async function GET(request: NextRequest, { params }: RouteParameters) {
  const { userId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    let query = supabase
      .from("events")
      .select("*")
      .eq("creator_profile_id", userId)
      .order("created_at", { ascending: false });

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    query = query.limit(limit + 1);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const morePagesExist = data.length > limit;
    const events = morePagesExist ? data.slice(0, limit) : data;
    const newCursor = morePagesExist ? data[limit - 1].created_at : null;

<<<<<<< HEAD
    return NextResponse.json({ items: events, cursor: newCursor });
=======
    return NextResponse.json({ events, cursor: newCursor });
>>>>>>> a01b879 (refactor(events-form): created generic infinite scroll hook)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
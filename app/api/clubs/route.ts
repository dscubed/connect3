import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

/**
 * Cursor based paginated retrieval of clubs (organisations)
 * Fetches from profiles table where account_type = 'organisation'
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    let query = supabase
      .from("profiles")
      .select("id, first_name, university, created_at, avatar_url")
      .eq("account_type", "organisation")
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

    const clubs = morePagesExist ? data.slice(0, limit) : data;
    const newCursor = morePagesExist ? data[limit - 1].created_at : null;

    return NextResponse.json({ items: clubs, cursor: newCursor });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

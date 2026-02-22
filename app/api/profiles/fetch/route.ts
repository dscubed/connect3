import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

/** Only these table/view names are allowed to prevent injection. */
const ALLOWED_TABLES = new Set(["profiles", "profile_detail"]);

/**
 * GET /api/profiles/fetch
 *
 * Fetches profile(s) server-side using the service-role key.
 * This keeps the profiles table locked down from public/anon RLS reads.
 *
 * Query params:
 *   - table:  "profiles" (default, lightweight) or "profile_detail" (includes links & chunks)
 *   - id:     single profile ID (returns single object)
 *   - ids:    comma-separated profile IDs (returns array)
 *   - select: comma-separated column names (default: "*")
 *   - search: search term to ilike on first_name (search mode)
 *   - filter: JSON-encoded filters, e.g. {"account_type":"organisation"}
 *   - limit:  max results for search mode (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") || "profiles";
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    const select = searchParams.get("select") || "*";
    const search = searchParams.get("search");
    const filterParam = searchParams.get("filter");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate table name
    if (!ALLOWED_TABLES.has(table)) {
      return NextResponse.json(
        { error: `Invalid table. Allowed: ${[...ALLOWED_TABLES].join(", ")}` },
        { status: 400 },
      );
    }

    // Parse optional filters like {"account_type": "organisation"}
    let filters: Record<string, string> = {};
    if (filterParam) {
      try {
        filters = JSON.parse(filterParam);
      } catch {
        return NextResponse.json(
          { error: "Invalid filter JSON" },
          { status: 400 },
        );
      }
    }

    // --- Search mode ---
    if (search) {
      let query = supabase
        .from(table)
        .select(select)
        .ilike("first_name", `%${search}%`)
        .limit(limit);

      // Apply extra equality filters
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }

      // Exclude specific IDs (e.g. current user)
      const excludeId = searchParams.get("excludeId");
      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Profile search error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    // --- Batch fetch mode ---
    if (ids) {
      const idArray = ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (idArray.length === 0) {
        return NextResponse.json(
          { error: "ids parameter is empty" },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from(table)
        .select(select)
        .in("id", idArray);

      if (error) {
        console.error("Batch profile fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    // --- Single fetch mode ---
    if (id) {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
          { error: error.message },
          { status: error.code === "PGRST116" ? 404 : 500 },
        );
      }

      return NextResponse.json({ data });
    }

    return NextResponse.json(
      { error: "Provide 'id', 'ids', or 'search' parameter" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Profile fetch route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

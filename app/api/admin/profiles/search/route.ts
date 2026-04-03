import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await verifyAdminToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const types = searchParams.getAll("type"); // "user" | "organisation"

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  let dbQuery = supabaseAdmin
    .from("profiles")
    .select("id, first_name, avatar_url, account_type")
    .order("first_name", { ascending: true })
    .limit(20);

  if (query.length > 0) {
    dbQuery = dbQuery.ilike("first_name", `%${query}%`);
  }

  if (types.length > 0) {
    dbQuery = dbQuery.in("account_type", types);
  }

  const { data: profiles, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch emails in parallel
  const results = await Promise.all(
    (profiles ?? []).map(async (profile) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        profile.id,
      );
      return {
        ...profile,
        email: authUser?.user?.email ?? null,
      };
    }),
  );

  return NextResponse.json({ data: results });
}

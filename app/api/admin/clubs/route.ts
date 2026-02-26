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

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: clubs, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, university, avatar_url")
    .eq("account_type", "organisation")
    .order("first_name", { ascending: true });

  if (profilesError) {
    console.error("Failed to fetch club profiles:", profilesError);
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const clubsWithEmail = await Promise.all(
    (clubs ?? []).map(async (club) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        club.id,
      );
      return {
        ...club,
        email: authUser?.user?.email ?? null,
      };
    }),
  );

  return NextResponse.json({ data: clubsWithEmail });
}

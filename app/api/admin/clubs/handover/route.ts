import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await verifyAdminToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clubId, newEmail, newPassword } = await req.json();

  if (!clubId || typeof clubId !== "string") {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }
  if (!newEmail || typeof newEmail !== "string") {
    return NextResponse.json({ error: "newEmail required" }, { status: 400 });
  }
  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 6
  ) {
    return NextResponse.json(
      { error: "newPassword required (min 6 chars)" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("account_type")
    .eq("id", clubId)
    .single();

  if (!profile || profile.account_type !== "organisation") {
    return NextResponse.json(
      { error: "Profile not found or not an organisation" },
      { status: 404 },
    );
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    clubId,
    {
      email: newEmail.toLowerCase().trim(),
      password: newPassword,
    },
  );

  if (updateError) {
    console.error("Handover update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

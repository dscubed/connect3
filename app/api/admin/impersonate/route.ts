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

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate link" },
      { status: 500 },
    );
  }

  const token_hash = data.properties?.hashed_token;
  const baseUrl =
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "https://connect3.app";

  const magicLink = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=magiclink&next=/`;

  return NextResponse.json({ magicLink });
}

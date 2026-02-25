import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.IMPERSONATE_SECRET_KEY;

export async function POST(req: NextRequest) {
  const { email, secret } = await req.json();

  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: error?.message ?? "Failed to generate link" }, { status: 500 });
  }

  const token_hash = data.properties?.hashed_token;
  const baseUrl =
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "https://connect3.app";

  const magicLink = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=magiclink&next=/`;

  return NextResponse.json({ magicLink });
}

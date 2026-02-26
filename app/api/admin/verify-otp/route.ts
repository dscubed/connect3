import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
} from "@/lib/admin/session";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and OTP required" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  const normalizedEmail = email.toLowerCase().trim();

  const { data: otpRecord, error } = await supabaseAdmin
    .from("admin_otps")
    .select("otp_hash, expires_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error || !otpRecord) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 401 },
    );
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 401 });
  }

  if (hashOtp(otp) !== otpRecord.otp_hash) {
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 401 });
  }

  await supabaseAdmin.from("admin_otps").delete().eq("email", normalizedEmail);

  const token = await createAdminToken(normalizedEmail);

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}

import { createClient } from "@supabase/supabase-js";
import { createHash, randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: adminRecord, error: lookupError } = await supabaseAdmin
    .from("admin_emails")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (lookupError) {
    console.error("admin_emails lookup error:", lookupError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (!adminRecord) {
    return NextResponse.json(
      { error: "Email not authorised" },
      { status: 403 },
    );
  }

  const otp = randomInt(100000, 999999).toString();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  const { error: upsertError } = await supabaseAdmin.from("admin_otps").upsert({
    email: email.toLowerCase().trim(),
    otp_hash: otpHash,
    expires_at: expiresAt,
  });

  if (upsertError) {
    console.error("admin_otps upsert error:", upsertError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supportSendEmail = process.env.NOREPLY_EMAIL ?? "noreply@connect3.app";

  try {
    await resend.emails.send({
      from: `Connect3 Admin <${supportSendEmail}>`,
      to: [email],
      subject: `Your admin OTP: ${otp}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 8px;font-size:20px;color:#111">Connect3 Admin Access</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#555">
            Use the code below to sign in to the admin dashboard. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#111">
            ${otp}
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#999">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send OTP email:", emailError);
    return NextResponse.json(
      { error: "Failed to send OTP email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

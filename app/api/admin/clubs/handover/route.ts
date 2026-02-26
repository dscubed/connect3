import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";
import { Resend } from "resend";

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
    .select("account_type, first_name")
    .eq("id", clubId)
    .single();

  if (!profile || profile.account_type !== "organisation") {
    return NextResponse.json(
      { error: "Profile not found or not an organisation" },
      { status: 404 },
    );
  }

  const normalizedEmail = newEmail.toLowerCase().trim();

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    clubId,
    {
      email: normalizedEmail,
      password: newPassword,
    },
  );

  if (updateError) {
    console.error("Handover update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect3.app";
  const noreplyEmail = process.env.NOREPLY_EMAIL ?? "noreply@connect3.app";
  const clubName = profile.first_name ?? "your club";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `Connect3 <${noreplyEmail}>`,
      to: [normalizedEmail],
      subject: "Your Connect3 Account is Ready!",
      html: handoverEmailHtml({
        clubName,
        email: normalizedEmail,
        password: newPassword,
        siteUrl,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send handover email:", emailError);
    // Don't fail the request — account is already transferred
  }

  return NextResponse.json({ success: true });
}

function handoverEmailHtml({
  clubName,
  email,
  password,
  siteUrl,
}: {
  clubName: string;
  email: string;
  password: string;
  siteUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f9f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- Logo with image -->
        <tr><td style="padding-bottom:32px;text-align:center">
          <img src="${siteUrl}/logo.png" alt="Connect3" width="32" height="28" style="display:inline-block;margin-right:8px;vertical-align:middle" />
          <span style="font-size:22px;font-weight:800;color:#854ecb;letter-spacing:-0.5px">Connect3</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:20px;padding:40px 36px;box-shadow:0 1px 4px rgba(0,0,0,.06)">

          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111">Your Connect3 Account is Ready 🎉</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6">
            Hey <strong>${clubName}</strong> — welcome to Connect3! We've set up your club account and can't wait to see you on the platform. Here's everything you need to get started.
          </p>

          <!-- Credentials block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;border-radius:12px;padding:20px 24px;margin-bottom:32px">
            <tr><td>
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.8px">Login Details</p>
              <p style="margin:0 0 10px;font-size:14px;color:#333"><strong>Email:</strong>&nbsp; ${email}</p>
              <p style="margin:0;font-size:14px;color:#333"><strong>Temporary Password:</strong>&nbsp;
                <span style="background:#e8e8ec;border-radius:6px;padding:2px 8px;font-family:monospace;font-size:13px;color:#444">${password}</span>
              </p>
            </td></tr>
          </table>

          <!-- Step 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td width="36" valign="top">
                <div style="width:28px;height:28px;background:#f9ecff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#854ecb">1</div>
              </td>
              <td valign="top" style="padding-left:12px">
                <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111">Log in to your account</p>
                <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.6">
                  Head to <a href="${siteUrl}/auth/login" style="color:#854ecb;text-decoration:none;font-weight:500">${siteUrl}/auth/login</a> and sign in with the credentials above. We recommend updating your password right away — it only takes a second.
                </p>
                <a href="${siteUrl}/auth/update-password" style="display:inline-block;background:#854ecb;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 18px;border-radius:8px">Update Password →</a>
              </td>
            </tr>
          </table>

          <!-- Step 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td width="36" valign="top">
                <div style="width:28px;height:28px;background:#f9ecff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#854ecb">2</div>
              </td>
              <td valign="top" style="padding-left:12px">
                <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111">Update your club profile</p>
                <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
                  Visit <a href="${siteUrl}/profile" style="color:#854ecb;text-decoration:none;font-weight:500">${siteUrl}/profile</a> to personalise your club page — update your display name, add a description, upcoming events, and info chunks that help students discover what you're all about.
                </p>
              </td>
            </tr>
          </table>

          <!-- Step 3 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px">
            <tr>
              <td width="36" valign="top">
                <div style="width:28px;height:28px;background:#f9ecff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#854ecb">3</div>
              </td>
              <td valign="top" style="padding-left:12px">
                <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111">Explore Connect3</p>
                <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
                  Take a look around — try the search, post an event, or just see how students are discovering clubs like yours. If anything feels off or you have an idea, we genuinely want to hear it. Drop us a note anytime through the <a href="${siteUrl}/contact" style="color:#854ecb;text-decoration:none;font-weight:500">contact form</a>.
                </p>
              </td>
            </tr>
          </table>

          <!-- Sign-off -->
          <p style="margin:0;font-size:14px;color:#555;line-height:1.7;border-top:1px solid #eee;padding-top:24px">
            Really glad to have you here. Connect3 is all about making it easier for students to find their people — and clubs like <strong>${clubName}</strong> are a huge part of that. Let's build something great together. 💜
          </p>
          <p style="margin:16px 0 0;font-size:14px;color:#555">— The Connect3 Team</p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center">
          <p style="margin:0;font-size:12px;color:#aaa">You're receiving this because your club account was set up on Connect3.</p>
          <p style="margin:4px 0 0;font-size:12px;color:#aaa">
            Questions? <a href="${siteUrl}/contact" style="color:#aaa">Contact us</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

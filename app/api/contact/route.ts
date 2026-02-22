import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email/ContactEmailTemplate";
import { checkBotId } from "botid/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const botVerification = await checkBotId();
    if (botVerification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const description = formData.get("description") as string;
    const screenshot = formData.get("screenshot") as File | null;

    // Validate inputs
    if (!name || !email || !description) {
      return NextResponse.json(
        { error: "Name, email, and description are required" },
        { status: 400 }
      );
    }

    if (description.length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Handle screenshot upload if provided
    let screenshotUrl: string | null = null;
    if (screenshot && screenshot.size > 0) {
      // Check file size (10MB limit)
      if (screenshot.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Screenshot must be less than 10MB" },
          { status: 400 }
        );
      }

      // Upload to Supabase Storage
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `contact-screenshots/${fileName}`;

      const arrayBuffer = await screenshot.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("contact-attachments")
        .upload(filePath, buffer, {
          contentType: screenshot.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading screenshot:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload screenshot" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("contact-attachments")
        .getPublicUrl(filePath);

      screenshotUrl = publicUrlData.publicUrl;
    }

    // Generate a short ticket ID for tracking
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketId = `C${timestamp}-${randomStr}`;

    // Send email notifications via Resend
    const supportSendEmail = process.env.SUPPORT_EMAIL;
    const supportReceiveEmail = process.env.SUPPORT_EMAIL;
    
    if (supportSendEmail && supportReceiveEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send to both user and support team
        await resend.emails.send({
          from: `Connect3 Support <${supportSendEmail}>`,
          to: [`${name} <${email}>`, `Connect3 Support <${supportReceiveEmail}>`], // Send to both user and support
          subject: `[${ticketId}] Support Request - ${name}`,
          html: EmailTemplate({
            name,
            email,
            description,
            screenshotUrl: screenshotUrl || undefined,
            ticketId,
          }),
        });

        console.log(`✅ Contact form emails sent to ${email} and ${supportReceiveEmail} (Ticket: ${ticketId})`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the request if email fails - submission is still stored in DB
      }
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

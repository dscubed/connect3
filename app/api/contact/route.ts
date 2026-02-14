import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
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

    // Store contact submission in database (optional)
    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name,
      email,
      description,
      screenshot_url: screenshotUrl,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Error storing contact submission:", dbError);
      // Don't fail the request if DB insert fails
    }

    // Send email notification via Resend
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    if (contactEmail) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "Connect3 Support <onboarding@resend.dev>",
          to: contactEmail,
          subject: `Contact Form Submission from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New Contact Form Submission</h2>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #333;">Issue Description:</h3>
                <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px;">
                  ${description}
                </p>
              </div>
              
              ${
                screenshotUrl
                  ? `
                <div style="margin: 20px 0;">
                  <h3 style="color: #333;">Screenshot:</h3>
                  <a href="${screenshotUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                    View Screenshot
                  </a>
                  <br/><br/>
                  <img src="${screenshotUrl}" alt="Screenshot" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" />
                </div>
              `
                  : ""
              }
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
              
              <p style="color: #666; font-size: 12px;">
                This email was sent from the Connect3 contact form.
              </p>
            </div>
          `,
        });

        console.log(`✅ Contact form email sent to ${contactEmail}`);
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

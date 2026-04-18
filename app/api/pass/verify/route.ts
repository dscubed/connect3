import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptMemberData } from "@/lib/pass/pass-generator";
import sharp from "sharp";
import jsQR from "jsqr";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to verify a pass" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 },
      );
    }

    // Convert uploaded image to raw RGBA pixel data using sharp
    const arrayBuffer = await file.arrayBuffer();
    const { data: pixels, info } = await sharp(Buffer.from(arrayBuffer))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Decode QR code from image
    const qrResult = jsQR(
      new Uint8ClampedArray(pixels),
      info.width,
      info.height,
    );

    if (!qrResult) {
      return NextResponse.json(
        { error: "No QR code found in image" },
        { status: 400 },
      );
    }

    // Decrypt the member data from the QR code
    const memberData = decryptMemberData(qrResult.data);

    // Look up the user in Supabase
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, university, account_type")
      .eq("id", memberData.userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User not found", decoded: memberData },
        { status: 404 },
      );
    }

    return NextResponse.json({
      verified: true,
      member: {
        name: memberData.name,
        email: memberData.email,
        userId: memberData.userId,
        profile: {
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
          university: profile.university,
          accountType: profile.account_type,
        },
      },
    });
  } catch (error) {
    console.error("Pass verification failed:", error);

    const message =
      error instanceof Error ? error.message : "Verification failed";

    return NextResponse.json(
      { error: message, verified: false },
      { status: 400 },
    );
  }
}

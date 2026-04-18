import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  encryptMemberData,
  generateApplePass,
  generateGooglePassUrl,
} from "@/lib/pass/pass-generator";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to generate a pass" },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const firstName = profile?.first_name;
    const lastName = profile?.last_name;
    const email = user.email;

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Missing profile information" },
        { status: 400 },
      );
    }

    const displayName = lastName ? `${firstName} ${lastName}` : firstName;
    const memberId = encryptMemberData(displayName, email, user.id);

    const passData = { name: displayName, email, userId: user.id, memberId };

    const googlePassUrl = generateGooglePassUrl(passData);
    const applePassBuffer = await generateApplePass(passData).catch((e) => {
      console.error("Apple pass generation failed:", e);
      return null;
    });

    return NextResponse.json({
      success: true,
      memberId,
      googlePassUrl: googlePassUrl ?? undefined,
      applePassData: applePassBuffer ? applePassBuffer.toJSON() : undefined,
    });
  } catch (error) {
    console.error("Error in pass generation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

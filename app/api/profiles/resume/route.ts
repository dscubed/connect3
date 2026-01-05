import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const user = authResult.user;
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("resume") as File;
  const profileId = formData.get("profileId") as string;

  if (!file || !profileId) {
    return NextResponse.json(
      { error: "Missing file or profileId" },
      {
        status: 400,
      }
    );
  }

  if (profileId !== user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  // Extract text from resume

  // Validate Resume content with LLM (only check for safe and relevant content)

  // Fetch existing profile context from Supabase

  // Call LLM to extract resume into profile chunks with specified fields

  // Get update/add with LLM extracted chunks

  // Return the updated/added profile chunks

  return NextResponse.json(
    { success: true, message: "Resume processed and profile updated." },
    { status: 200 }
  );
}

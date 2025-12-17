import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/upload";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export const config = {
  runtime: "edge",
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate user via Supabase Auth
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;
    const { userId, orderedCategoryChunks } = await request.json();

    // Validate input
    if (!userId || !orderedCategoryChunks || !user) {
      return NextResponse.json(
        { error: "userId, orderedCategoryChunks, or authentication required" },
        { status: 400 }
      );
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    // Get user information from Supabase
    const userDetails = await fetchUserDetails(userId);
    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upload to OpenAI Vector Store
    const fileId = await uploadProfileToVectorStore({
      userId,
      orderedCategoryChunks,
    });

    // Update file id in supabase
    const { error } = await supabase
      .from("profiles")
      .update({ openai_file_id: fileId })
      .eq("id", userId);
    if (error) {
      console.error("Error updating Supabase profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile with OpenAI file ID" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile uploaded successfully",
      fileId,
    });
  } catch (error) {
    console.error("❌ Error in uploadProfile route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

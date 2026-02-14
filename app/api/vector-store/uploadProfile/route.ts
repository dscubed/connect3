import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/upload";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
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
    const { userId } = await request.json();

    // Validate input
    if (!userId || !user) {
      return NextResponse.json(
        { error: "userId, or authentication required" },
        { status: 400 },
      );
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    // Check if a profile upload is already in progress
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("is_processing_upload")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 },
      );
    }

    if (profile?.is_processing_upload) {
      return NextResponse.json(
        { error: "Profile upload already in progress" },
        { status: 409 },
      );
    }

    // Set the processing flag
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_processing_upload: true })
      .eq("id", userId);

    if (updateError) {
      console.error("Error setting processing flag:", updateError);
      return NextResponse.json(
        { error: "Failed to start profile upload" },
        { status: 500 },
      );
    }

    try {
      // Process the upload synchronously
      const fileId = await uploadProfileToVectorStore({
        userId,
        supabase,
      });

      // Update profile with new file ID
      const { error: fileIdUpdateError } = await supabase
        .from("profiles")
        .update({ openai_file_id: fileId, is_processing_upload: false })
        .eq("id", userId);

      if (fileIdUpdateError) {
        console.error("Error updating profile with file ID:", fileIdUpdateError);
        // Still reset the processing flag
        await supabase
          .from("profiles")
          .update({ is_processing_upload: false })
          .eq("id", userId);
        
        return NextResponse.json(
          { error: "Failed to update profile with file ID" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { message: "Profile uploaded successfully", fileId },
        { status: 200 },
      );
    } catch (uploadError) {
      console.error("Error uploading profile:", uploadError);
      
      // Reset the processing flag on error
      await supabase
        .from("profiles")
        .update({ is_processing_upload: false })
        .eq("id", userId);

      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : "Failed to upload profile" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error in uploadProfile route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

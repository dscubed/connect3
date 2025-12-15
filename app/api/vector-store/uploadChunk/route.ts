import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const { userId, text, category } = await request.json();

    if (!userId || !text || !user) {
      return NextResponse.json(
        { error: "userId, text, or authentication required" },
        { status: 400 }
      );
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    // Get vector store ID from environment variables
    const userVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID;
    const orgVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID;

    // Get user type from Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", userId)
      .single();
    if (profileError || !userProfile) {
      console.error("Error fetching user profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }
    const isOrgUser = userProfile.account_type === "organisation";
    const vectorStoreId = isOrgUser ? orgVectorStoreId : userVectorStoreId;

    if (!vectorStoreId) {
      throw new Error(
        "Vector Store ID not configured in environment variables"
      );
    }

    // Upload to OpenAI Vector Store
    console.log("Uploading to vector store...");

    const fileObj = new File([text], `summary_${Date.now()}.txt`, {
      type: "text/plain",
    });
    console.log("File content:", await fileObj.text());

    const file = await openai.files.create({
      file: fileObj,
      purpose: "assistants",
    });

    const vectorStoreFile = await openai.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: file.id,
      }
    );

    if (vectorStoreFile.status === "failed") {
      throw new Error(
        `Failed to add file to vector store: ${
          vectorStoreFile.last_error?.message || "Unknown error"
        }`
      );
    }

    if (!file.id) {
      throw new Error("OpenAI did not return a file ID");
    }

    const userDetails = await fetchUserDetails(userId);
    const userName = userDetails?.full_name;

    // Attach attributes after successful upload
    await openai.vectorStores.files.update(file.id, {
      vector_store_id: vectorStoreId,
      attributes: {
        id: userId,
        category: category || "General",
        name: userName || "",
        type: isOrgUser ? "organisation" : "user",
      },
    });

    const { data, error } = await supabase
      .from("user_files")
      .insert({
        user_id: userId,
        openai_file_id: file.id,
        summary_text: text,
        status: "completed",
        created_at: new Date().toISOString(),
        category: category || "General",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      uploadedFileId: file.id,
      supabaseRecordId: data.id,
    });
  } catch (error) {
    console.error("Upload process error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

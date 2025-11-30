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

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user and check fields and permissions
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { rowId, userId, text, category } = await request.json();

    if (!rowId || !userId || !text || !user) {
      return NextResponse.json(
        { error: "rowId, userId, text, or authentication required" },
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
      .select("user_type")
      .eq("id", userId)
      .single();
    if (profileError || !userProfile) {
      console.error("Error fetching user profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }
    const isOrgUser = userProfile.user_type === "organisation";
    const vectorStoreId = isOrgUser ? orgVectorStoreId : userVectorStoreId;

    if (!vectorStoreId) {
      throw new Error(
        "Vector Store ID not configured in environment variables"
      );
    }

    // Gets Existing record and deletes old file from OpenAI if exists
    const { data: existingRecord } = await supabase
      .from("user_files")
      .select("openai_file_id")
      .eq("id", rowId)
      .single();

    if (existingRecord?.openai_file_id) {
      await openai.vectorStores.files.delete(existingRecord.openai_file_id, {
        vector_store_id: vectorStoreId,
      }); // Delete from vector store first

      await openai.files.delete(existingRecord.openai_file_id); // delete the OpenAI file
    }

    // Upload new file to OpenAI Vector Store
    console.log("Uploading to vector store...");

    console.log("Chunk text before upload:", JSON.stringify(text));
    const fileObj = new File([text], `summary_${Date.now()}.txt`, {
      type: "text/plain",
    });
    console.log("File content:", fileObj.text);

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
        userId: userId,
        uploadedBy: userName || "",
        category: category || "General",
      },
    });

    // Update the existing row with rowId
    const { data, error } = await supabase
      .from("user_files")
      .update({
        openai_file_id: file.id,
        summary_text: text,
        status: "completed",
        updated_at: new Date().toISOString(),
        category: category || "General",
      })
      .eq("id", rowId)
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

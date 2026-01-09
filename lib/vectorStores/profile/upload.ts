import OpenAI from "openai";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { getFileText } from "../../users/getFileText";
import { SupabaseClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const userVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID;
const orgVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID;

export async function uploadProfileToVectorStore({
  userId,
  supabase,
}: {
  userId: string;
  supabase: SupabaseClient;
}) {
  const userDetails = await fetchUserDetails(userId);
  console.log("Fetched user details:", userDetails);

  if (!userDetails) {
    throw new Error("User not found");
  }

  // Get vector store ID based on user type
  const isOrgUser = userDetails.account_type === "organisation";
  const vectorStoreId = isOrgUser ? orgVectorStoreId : userVectorStoreId;

  if (!vectorStoreId) {
    throw new Error("Vector store ID is not configured");
  }

  console.log(
    `Uploading profile for user ${userId} to vector store ${vectorStoreId}`
  );
  // If user already has a file remove it from vector store
  if (userDetails.openai_file_id) {
    console.log(
      `User ${userId} has existing OpenAI file ID ${userDetails.openai_file_id}, removing from vector store`
    );
    await removeProfileFromVectorStore(
      userDetails.openai_file_id,
      vectorStoreId,
      supabase,
      userId
    );
  }

  // Prepare text for upload
  const text = await getFileText(userId, supabase);

  // Prepare file for OpenAI upload
  const fileObj = new File(
    [text],
    `${userDetails.account_type}_${Date.now()}.txt`,
    {
      type: "text/plain",
    }
  );

  const file = await openai.files.create({
    file: fileObj,
    purpose: "assistants",
  });

  // Upload file to OpenAI Vector Store
  const vectorStoreFile = await openai.vectorStores.files.createAndPoll(
    vectorStoreId,
    {
      file_id: file.id,
    }
  );
  console.log("Uploaded file with text", text.slice(0, 100));

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

  // Attach attributes after successful upload
  await openai.vectorStores.files.update(file.id, {
    vector_store_id: vectorStoreId,
    attributes: {
      id: userId,
      name: userDetails.full_name || "",
      type: isOrgUser ? "organisation" : "user",
    },
  });

  return file.id;
}

async function removeProfileFromVectorStore(
  openaiFileId: string,
  vectorStoreId: string,
  supabase: SupabaseClient,
  userId: string
) {
  // 1) Try to remove from vector store (detach)
  try {
    await openai.vectorStores.files.delete(openaiFileId, {
      vector_store_id: vectorStoreId,
    });
    console.log(
      `Detached file ${openaiFileId} from vector store ${vectorStoreId}`
    );
  } catch (err: any) {
    // If it's already not in the vector store, that's fine
    if (err?.status === 404) {
      console.warn(
        `File ${openaiFileId} not found in vector store ${vectorStoreId}; skipping detach`
      );
    } else {
      console.error("Error detaching file from vector store:", err);
      throw err;
    }
  }

  // 2) Try to delete the underlying OpenAI file
  try {
    await openai.files.delete(openaiFileId);
    console.log(`Deleted OpenAI file ${openaiFileId}`);
  } catch (err: any) {
    // If the file is already gone, that's fine
    if (err?.status === 404) {
      console.warn(`OpenAI file ${openaiFileId} already deleted; skipping`);
    } else {
      console.error("Error deleting OpenAI file:", err);
      throw err;
    }
  }

  // 3) Always clear Supabase openai_file_id so we don't keep stale references
  const { error } = await supabase
    .from("profiles")
    .update({ openai_file_id: null })
    .eq("id", userId);
  if (error) {
    console.error(
      "Error removing OpenAI file ID from Supabase profile:",
      error
    );
    throw new Error("Failed to remove OpenAI file ID from profile");
  }
  console.log(`Cleared openai_file_id for user ${userId}`);
}

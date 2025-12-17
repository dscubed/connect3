import OpenAI from "openai";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { CategoryChunks } from "@/components/profile/chunks/hooks/ChunkProvider";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const userVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID;
const orgVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID;

export const config = {
  runtime: "edge",
};

export async function uploadProfileToVectorStore({
  userId,
  orderedCategoryChunks,
}: {
  userId: string;
  orderedCategoryChunks: CategoryChunks[];
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
      vectorStoreId
    );
  }

  // Prepare text for upload
  const profileText = `${userDetails.full_name}\n${userDetails.tldr || ""}`;

  let chunkText = "";
  for (const categoryChunk of orderedCategoryChunks) {
    chunkText += `${categoryChunk.category}:\n`;
    for (const chunk of categoryChunk.chunks) {
      chunkText += `- ${chunk.text}\n`;
    }
  }

  const fullText = `${profileText}\n\n${chunkText}`;

  // Prepare file for OpenAI upload
  const fileObj = new File(
    [fullText],
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
  vectorStoreId: string
) {
  // Remove from vector store
  const { deleted: vsFileDeleted } = await openai.vectorStores.files.delete(
    openaiFileId,
    {
      vector_store_id: vectorStoreId,
    }
  );

  // Remove from OpenAI files
  const { deleted: openaiFileDeleted } = await openai.files.delete(
    openaiFileId
  );

  const deleted = vsFileDeleted && openaiFileDeleted;

  if (!deleted) {
    throw new Error("Failed to delete file from vector store");
  }

  console.log(
    `Removed file ${openaiFileId} from vector store ${vectorStoreId}`
  );
}

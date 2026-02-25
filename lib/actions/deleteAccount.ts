"use server";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function deleteVectorStoreFile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("openai_file_id, account_type")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching OpenAI file ID:", error);
    return;
  }

  const fileId = (
    data as { openai_file_id: string | null; account_type: string }
  ).openai_file_id;
  const accountType = (
    data as { openai_file_id: string | null; account_type: string }
  ).account_type;

  if (!fileId) {
    console.error("OpenAI file ID not found for user:", userId);
    return;
  }

  const vectorStoreId =
    accountType === "user"
      ? process.env.OPENAI_USER_VECTOR_STORE_ID!
      : process.env.OPENAI_ORG_VECTOR_STORE_ID!;

  try {
    await openai.vectorStores.files.delete(fileId, {
      vector_store_id: vectorStoreId,
    });
  } catch (err) {
    console.error("Error deleting OpenAI file:", err);
  }
}

export async function deleteAccount() {
  const serverSupabase = await createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = user.id;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  // Delete avatar folder from storage
  const { data: avatarFiles, error: listError } = await supabaseAdmin.storage
    .from("avatars")
    .list(userId);

  if (listError) {
    console.error("Error listing avatar files:", listError);
    return { success: false, error: "Failed to list avatar files" };
  }

  if (avatarFiles && avatarFiles.length > 0) {
    const filePaths = avatarFiles.map((file) => `${userId}/${file.name}`);
    const { error: removeError } = await supabaseAdmin.storage
      .from("avatars")
      .remove(filePaths);

    if (removeError) {
      console.error("Error removing avatar files:", removeError);
      return { success: false, error: "Failed to delete avatar files" };
    }
  }

  // Delete file from vector store
  await deleteVectorStoreFile(supabaseAdmin, userId);

  // Delete user from auth.users (cascades to profiles via FK)
  const { error: deleteError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("Error deleting user:", deleteError);
    return { success: false, error: "Failed to delete account" };
  }

  return { success: true };
}

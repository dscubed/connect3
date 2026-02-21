"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

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
    { auth: { persistSession: false } }
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

  // Delete user from auth.users (cascades to profiles via FK)
  const { error: deleteError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("Error deleting user:", deleteError);
    return { success: false, error: "Failed to delete account" };
  }

  return { success: true };
}

import { toast } from "sonner";
import { createClient } from "./client";
import { SupabaseClient } from "@supabase/supabase-js";

// Resize image to 256x256 using the resize API
async function resizeImageFile(file: File): Promise<File> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/resize", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to resize image");

  const blob = await response.blob();
  return new File([blob], file.name.replace(/\.[^.]+$/, ".png"), {
    type: "image/png",
  });
}

export async function uploadAvatar(file: File, userId?: string) {
  const supabase = createClient();
  // Always use .png since the cropper outputs png
  const fileName = `${crypto.randomUUID()}.png`;
  const filePath = userId ? `${userId}/${fileName}` : fileName;

  // Image is already cropped and resized to 256x256 by the client-side cropper

  try {
    // Upload resized original
    const { error: origError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (origError) throw origError;

    // Get public URLs
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function uploadEventThumbnail(file: File) {
  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.png`;
  const filePath = fileName;
  const bucket = "auto_instagram_cache";
  // TODO: Ensure the bucket exists and has an INSERT policy for authenticated users
  // (or update this bucket name to match the team's storage policy).

  try {
    // Image is already cropped by the client-side cropper

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading event thumbnail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

function getStoragePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  // Find everything after the first "/avatars/"
  const match = url.match(/\/avatars\/(.+)$/);
  return match ? match[1] : null;
}

export async function deleteAvatar(userId: string, supabase: SupabaseClient) {
  const result = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (result.error) {
    console.error("Error fetching profile for deletion:", result.error);
    return { success: false, error: result.error.message };
  }

  const avatarPath = getStoragePathFromUrl(result.data.avatar_url);

  if (
    avatarPath ==
    `${process.env.NEXT_PUBLIC_URL}/storage/v1/object/public/avatars/placeholder_avatar.png`
  ) {
    console.log("Placeholder avatar detected, skipping deletion.");
    return { success: true };
  }

  try {
    console.log("Deleting avatar files:", avatarPath);
    const { error } = await supabase.storage
      .from("avatars")
      .remove([avatarPath || ""]);

    if (error) throw error;

    console.log("Deleted avatars:", result.data.avatar_url);

    return { success: true };
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
export async function updateAvatar(
  userId: string,
  file: File,
  supabase: SupabaseClient
) {
  const uploadResult = await uploadAvatar(file, userId);
  if (!uploadResult.success || !uploadResult.url) {
    toast.error(
      `Failed to upload new avatar: ${uploadResult.error || "Unknown error"}`
    );
    return { success: false, error: uploadResult.error || "Upload failed" };
  }

  const deleteResult = await deleteAvatar(userId, supabase);
  if (!deleteResult.success) {
    toast.error(
      `Failed to delete old avatar: ${deleteResult.error || "Unknown error"}`
    );
  }

  return {
    success: true,
    url: uploadResult.url,
  };
}

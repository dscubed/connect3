import { toast } from "sonner";
import { createClient } from "./client";
import { SupabaseClient } from "@supabase/supabase-js";

// Replace blurImageFile with sharp version
async function blurImageFile(file: File): Promise<File> {
  // Send the file to your API route
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/blur", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to blur image");

  const blob = await response.blob();
  return new File([blob], file.name.replace(/\.[^.]+$/, ".blurred.png"), {
    type: "image/png",
  });
}

export async function uploadAvatar(file: File, userId?: string) {
  const supabase = createClient();
  // Generate random UUID filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const filePath = `${userId}/${fileName}`;

  // Blur the image
  const blurredFile = await blurImageFile(file);
  const blurredFileName = `blurred/${crypto.randomUUID()}.png`;
  const blurredFilePath = `${blurredFileName}`;

  try {
    // Upload original
    const { error: origError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (origError) throw origError;

    // Upload blurred
    const { error: blurError } = await supabase.storage
      .from("avatars")
      .upload(blurredFilePath, blurredFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (blurError) throw blurError;

    // Get public URLs
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    const { data: blurredUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(blurredFilePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      blurredUrl: blurredUrlData.publicUrl,
      path: filePath,
      blurredPath: blurredFilePath,
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
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}_${file.name}`;
  const filePath = fileName;
  const bucket = "auto_instagram_cache";
  // TODO: Ensure the bucket exists and has an INSERT policy for authenticated users
  // (or update this bucket name to match the team's storage policy).

  try {
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
    .select("avatar_url, blurred_avatar_url")
    .eq("id", userId)
    .single();

  if (result.error) {
    console.error("Error fetching profile for deletion:", result.error);
    return { success: false, error: result.error.message };
  }

  const avatarPath = getStoragePathFromUrl(result.data.avatar_url);
  const blurredAvatarPath = getStoragePathFromUrl(
    result.data.blurred_avatar_url
  );

  if (
    avatarPath ==
    `${process.env.NEXT_PUBLIC_URL}/storage/v1/object/public/avatars/placeholder_avatar.png`
  ) {
    console.log("Placeholder avatar detected, skipping deletion.");
    return { success: true };
  }

  try {
    console.log("Deleting avatar files:", avatarPath, blurredAvatarPath);
    const { error } = await supabase.storage
      .from("avatars")
      .remove([avatarPath || "", blurredAvatarPath || ""]);

    if (error) throw error;

    console.log(
      "Deleted avatars:",
      result.data.avatar_url,
      result.data.blurred_avatar_url
    );

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
  if (!uploadResult.success || !uploadResult.url || !uploadResult.blurredUrl) {
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
    blurredUrl: uploadResult.blurredUrl,
  };
}

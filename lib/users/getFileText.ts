import { SupabaseClient } from "@supabase/supabase-js";
import { LinkTypes } from "@/components/profile/links/LinksUtils";
import {
  universities,
  University,
} from "@/components/profile/details/univeristies";

async function getOrderedChunks(profileId: string, supabase: SupabaseClient) {
  const { data: chunksData, error: chunksError } = await supabase
    .from("profile_chunks")
    .select("text, category, order")
    .eq("profile_id", profileId)
    //.order("created_at", { ascending: true });
  if (chunksError || !chunksData) {
    throw new Error(`Error fetching profile chunks: ${chunksError.message}`);
  }

  const { data: categoryOrderData, error: categoryOrderError } = await supabase
    .from("profile_chunk_categories")
    .select("category, order")
    .eq("profile_id", profileId);
  if (categoryOrderError || !categoryOrderData) {
    throw new Error(
      `Error fetching category order: ${categoryOrderError.message}`
    );
  }

  /*const orderedChunks = categoryOrderData.map(({ category }) => ({
    category,
    chunks: chunksData
      .filter((chunk) => chunk.category === category)
      .sort((a, b) => a.order - b.order),
  }));*/

  const orderedChunks = categoryOrderData
  .sort((a, b) => a.order - b.order)
  .map(({ category }) => ({
    category,
    chunks: chunksData
      .filter((chunk) => chunk.category === category)
      .sort((a, b) => a.order - b.order),
  }));


  return {
    orderedChunks,
  };
}

async function getProfileData(profileId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, account_type, university, tldr")
    .eq("id", profileId)
    .single();
  if (error || !data) {
    throw new Error(`Error fetching profile data: ${error.message}`);
  }
  return data;
}

async function getProfileLinks(profileId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profile_links")
    .select("type, details")
    .eq("profile_id", profileId);

  if (error || !data) {
    throw new Error(`Error fetching links: ${error.message}`);
  }

  const profileLinks = data
    .filter((link: { type: string; details: string }) => link.type in LinkTypes)
    .map((link: { type: keyof typeof LinkTypes; details: string }) => ({
      type: link.type,
      details: `${LinkTypes[link.type].pattern?.prefix ?? ""}${link.details}`,
    }));
  return profileLinks;
}

export async function getFileText(profileId: string, supabase: SupabaseClient) {
  const profileData = await getProfileData(profileId, supabase);
  const profileChunks = await getOrderedChunks(profileId, supabase);
  const profileLinks = await getProfileLinks(profileId, supabase);

  const tldr = profileData.tldr || "";

  const name = `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`.trim() || "Unknown";
  const profileText = `
  ${name} (${profileData.account_type})
  University: ${
    universities[profileData.university as University]?.name || "Not specified"
  }
  ${tldr.length > 0 ? tldr : "No summary provided."}`;

  const linksText = profileLinks
    .map((link) => `${link.type}: ${link.details}`)
    .join("\n");

  let chunkText = "";
  for (const category of profileChunks.orderedChunks) {
    chunkText += `${category.category}`;
    for (const chunk of category.chunks) {
      chunkText += `\n- ${chunk.text}`;
    }
  }

  const text =
    profileText.trim() + "\n" + linksText.trim() + "\n" + chunkText.trim();

  return text;
}

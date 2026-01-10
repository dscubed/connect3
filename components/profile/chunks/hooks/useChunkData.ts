import { useAuthStore } from "@/stores/authStore";
import { useCallback, useState } from "react";
import { ProfileChunk } from "../ChunkUtils";
import { CategoryOrderData } from "../ChunkUtils";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";

export function useChunkData({
  setChunks,
  setCategoryOrder,
  chunks,
  categoryOrder,
}: {
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  setCategoryOrder: React.Dispatch<React.SetStateAction<CategoryOrderData[]>>;
  chunks: ProfileChunk[];
  categoryOrder: CategoryOrderData[];
}) {
  const { user, getSupabaseClient, profile } = useAuthStore.getState();
  const supabase = getSupabaseClient();

  const [prevChunks, setPrevChunks] = useState<ProfileChunk[]>([]);
  const [prevCategoryOrder, setPrevCategoryOrder] = useState<
    CategoryOrderData[]
  >([]);
  const [loadingChunks, setLoadingChunks] = useState<boolean>(true);
  const [savingChunks, setSavingChunks] = useState<boolean>(false);

  // Fetch chunks from Supabase
  const fetchChunks = useCallback(async () => {
    setLoadingChunks(true);
    try {
      if (!profile) {
        return;
      }

      const { data: chunksData, error: chunksError } = await supabase
        .from("profile_chunks")
        .select("id, text, category, order")
        .eq("profile_id", profile.id);

      if (chunksError) {
        console.error("Error fetching chunks:", chunksError);
        throw chunksError;
      }

      const { data: categoryOrderData, error: categoryError } = await supabase
        .from("profile_chunk_categories")
        .select("category, order")
        .eq("profile_id", profile.id)
        .order("order", { ascending: true });

      if (categoryError) {
        console.error("Error fetching category order:", categoryError);
        throw categoryError;
      }

      if (!categoryOrderData || !chunksData) {
        throw new Error("No chunk data found");
      }

      // Set fetched data to current state
      setChunks(chunksData as ProfileChunk[]);
      setCategoryOrder(categoryOrderData as CategoryOrderData[]);

      // Set fetched data to prev state for tracking
      setPrevChunks(chunksData as ProfileChunk[]);
      setPrevCategoryOrder(categoryOrderData as CategoryOrderData[]);
    } catch (error) {
      console.error("Failed to load chunks:", error);
    } finally {
      setLoadingChunks(false);
    }
  }, [profile, supabase, setChunks, setCategoryOrder]);

  // Reset chunks to last fetched state
  const reset = () => {
    setChunks(prevChunks);
    setCategoryOrder(prevCategoryOrder);
  };

  const saveChunks = async () => {
    if (!profile || savingChunks || user?.id !== profile.id) return;
    setSavingChunks(true);

    // Identify deleted chunks/categories
    const deletedChunkIds = prevChunks
      .filter((prevChunk) => !chunks.find((chunk) => chunk.id === prevChunk.id))
      .map((chunk) => chunk.id);
    const deletedCategories = prevCategoryOrder.filter(
      (prevCat) =>
        !categoryOrder.find((cat) => cat.category === prevCat.category)
    );

    try {
      // Delete removed categories
      if (deletedCategories.length > 0) {
        const { error: delCatError } = await supabase
          .from("profile_chunk_categories")
          .delete()
          .eq("profile_id", profile.id)
          .in(
            "category",
            deletedCategories.map((cat) => cat.category)
          );
        if (delCatError) {
          console.error("Error deleting categories:", delCatError);
          throw delCatError;
        }
      }

      // Upsert categories
      const { error: categoryError } = await supabase
        .from("profile_chunk_categories")
        .upsert(
          categoryOrder.map((cat, index) => ({
            profile_id: profile.id,
            category: cat.category,
            order: index,
          })),
          { onConflict: "profile_id, category" }
        );
      if (categoryError) {
        console.error("Error saving category order:", categoryError);
        throw categoryError;
      }

      // Delete removed chunks
      if (deletedChunkIds.length > 0) {
        const { error: delChunkError } = await supabase
          .from("profile_chunks")
          .delete()
          .eq("profile_id", profile.id)
          .in("id", deletedChunkIds);
        if (delChunkError) {
          console.error("Error deleting chunks:", delChunkError);
          throw delChunkError;
        }
      }

      // Upsert chunks
      const { error: chunksError } = await supabase
        .from("profile_chunks")
        .upsert(
          chunks.map((chunk) => ({
            id: chunk.id,
            profile_id: profile.id,
            text: chunk.text,
            category: chunk.category,
            order: chunk.order,
          })),
          { onConflict: "id" }
        );

      if (chunksError) {
        console.error("Error saving chunks:", chunksError);
        throw chunksError;
      }

      // Update prev states to current
      setPrevChunks(chunks);
      setPrevCategoryOrder(categoryOrder);

      // save profile to vector store
      await uploadProfileToVectorStore();
    } catch (error) {
      console.error("Failed to save chunks:", error);
    } finally {
      setSavingChunks(false);
    }
  };

  return {
    fetchChunks,
    saveChunks,
    reset,
    loadingChunks,
    savingChunks,
  };
}

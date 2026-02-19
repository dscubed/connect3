import { useAuthStore } from "@/stores/authStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { AllCategories, ProfileChunk } from "../ChunkUtils";
import { CategoryOrderData } from "../ChunkUtils";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";

export interface UseChunkDataExports {
  fetchChunks: () => Promise<void>;
  saveChunks: () => Promise<void>;
  hasChunkChanges: () => boolean;
  loadingChunks: boolean;
  savingChunks: boolean;
  reset: () => void;
}

export function useChunkData({
  setChunks,
  setCategoryOrder,
  chunks,
  categoryOrder,
  visitingProfileId,
}: {
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  setCategoryOrder: React.Dispatch<React.SetStateAction<CategoryOrderData[]>>;
  chunks: ProfileChunk[];
  categoryOrder: CategoryOrderData[];
  visitingProfileId: string | undefined;
}) {
  const { user, getSupabaseClient, profile } = useAuthStore.getState();
  const supabase = getSupabaseClient();

  console.log("Visitor Id received:", visitingProfileId);
  const isVisiting = visitingProfileId && visitingProfileId !== user?.id;
  const profileId = visitingProfileId || user?.id || "";

  const [prevChunks, setPrevChunks] = useState<ProfileChunk[]>([]);
  const [prevCategoryOrder, setPrevCategoryOrder] = useState<
    CategoryOrderData[]
  >([]);
  const [loadingChunks, setLoadingChunks] = useState<boolean>(true);
  const [savingChunks, setSavingChunks] = useState<boolean>(false);

  // Refs to always provide the latest values inside async callbacks,
  // avoiding stale closures across React render boundaries.
  const chunksRef = useRef(chunks);
  chunksRef.current = chunks;
  const prevChunksRef = useRef(prevChunks);
  prevChunksRef.current = prevChunks;
  const categoryOrderRef = useRef(categoryOrder);
  categoryOrderRef.current = categoryOrder;
  const prevCategoryOrderRef = useRef(prevCategoryOrder);
  prevCategoryOrderRef.current = prevCategoryOrder;
  const savingChunksRef = useRef(savingChunks);
  savingChunksRef.current = savingChunks;

  // Track current profileId to handle race conditions
  const currentProfileIdRef = useRef<string>(profileId);

  // Update ref whenever profileId changes
  useEffect(() => {
    currentProfileIdRef.current = profileId;
    // Clear chunks immediately when switching profiles
    setChunks([]);
    setCategoryOrder([]);
  }, [profileId, setChunks, setCategoryOrder]);

  const fetchChunksFromSupabase = useCallback(
    async (profileId: string) => {
      /**
       * Fetches chunks and category order for a given profile from Supabase.
       *
       * @param profile - The profile whose chunks are to be fetched.
       * @returns An object containing arrays of fetched chunks and category order data.
       */
      console.log("Fetching chunks for profileId:", profileId);

      const chunksResponse = await supabase
        .from("profile_chunks")
        .select("id, text, category, order")
        .eq("profile_id", profileId);
      const { data: chunksData, error: chunksError } = chunksResponse;

      console.log("Fetched chunks:", chunksResponse);

      if (chunksError) {
        console.error("Error fetching chunks:", chunksError);
        throw chunksError;
      }

      const { data: categoryOrderData, error: categoryError } = await supabase
        .from("profile_chunk_categories")
        .select("category, order")
        .eq("profile_id", profileId)
        .order("order", { ascending: true });

      if (categoryError) {
        console.error("Error fetching category order:", categoryError);
        throw categoryError;
      }

      if (!categoryOrderData || !chunksData) {
        throw new Error("No chunk data found");
      }

      return { chunksData, categoryOrderData };
    },
    [supabase]
  );

  const setFetchedChunks = useCallback(
    ({
      chunksData,
      categoryOrderData,
    }: {
      chunksData: ProfileChunk[];
      categoryOrderData: CategoryOrderData[];
    }) => {
      /**
       * Sets the fetched chunks and category order data to state.
       * - Updates both current state and previous state for change tracking.
       *
       * @param chunksData - The fetched profile chunks.
       * @param categoryOrderData - The fetched category order data.
       */
      console.log("Setting fetched chunks as", chunksData);
      setChunks(chunksData as ProfileChunk[]);
      setCategoryOrder(categoryOrderData as CategoryOrderData[]);

      setPrevChunks(chunksData as ProfileChunk[]);
      setPrevCategoryOrder(categoryOrderData as CategoryOrderData[]);
    },
    [setChunks, setCategoryOrder]
  );

  // Fetch chunks from Supabase
  const fetchChunks = useCallback(async () => {
    /**
     * Fetches the profile chunks and their category order from Supabase and sets them to state.
     * - Fetches chunks from "profile_chunks" table.
     * - Fetches category order from "profile_chunk_categories" table.
     * - Sets the fetched data to both current state and previous state for change tracking.
     */
    if (!profileId) {
      console.log("No profileId, skipping fetch");
      return;
    }

    // Capture the profileId we're fetching for
    const fetchingForId = profileId;

    setLoadingChunks(true);

    try {
      console.log("Starting to load chunks for:", fetchingForId);

      const { chunksData, categoryOrderData } = await fetchChunksFromSupabase(
        fetchingForId
      );

      // Only apply results if this is still the current profile
      if (currentProfileIdRef.current === fetchingForId) {
        console.log("Applying chunks for:", fetchingForId);
        setFetchedChunks({ chunksData, categoryOrderData });
      } else {
        console.log(
          "Discarding stale fetch result for:",
          fetchingForId,
          "current is:",
          currentProfileIdRef.current
        );
      }
    } catch (error) {
      console.error("Failed to load chunks:", error);
    } finally {
      // Only update loading state if still on the same profile
      if (currentProfileIdRef.current === fetchingForId) {
        setLoadingChunks(false);
      }
    }
  }, [profileId, setFetchedChunks, fetchChunksFromSupabase]);

  useEffect(() => {
    if (profileId && profileId !== "") {
      fetchChunks();
    }
  }, [profileId, fetchChunks]);

  const reset = () => {
    /**
     * Resets the current chunks and category order to the previously saved state.
     * - Used to discard unsaved changes.
     */
    setChunks(prevChunks);
    setCategoryOrder(prevCategoryOrder);
  };

  const getDeletedChunksAndCategories = () => {
    /**
     * Identifies deleted chunks and categories by comparing current state with previous state.
     * - Used to determine which items need to be removed from the database upon saving.
     *
     * @return An object containing arrays of deleted chunk IDs and deleted categories.
     */
    const deletedChunkIds = prevChunks
      .filter((prevChunk) => !chunks.find((chunk) => chunk.id === prevChunk.id))
      .map((chunk) => chunk.id);
    const deletedCategories = prevCategoryOrder.filter(
      (prevCat) =>
        !categoryOrder.find((cat) => cat.category === prevCat.category)
    );
    return { deletedChunkIds, deletedCategories };
  };

  const getEditedChunksAndCategories = () => {
    /**
     * Identifies edited chunks and categories by comparing current state with previous state.
     * - Used to determine which items need to be added to the database upon saving.
     *
     * @return An object containing arrays of edited chunks and categories.
     */
    const editedChunks = chunks.filter((chunk) => {
      const prevChunk = prevChunks.find((pc) => pc.id === chunk.id);
      if (!prevChunk) return false;
      return (
        prevChunk.text !== chunk.text ||
        prevChunk.category !== chunk.category ||
        prevChunk.order !== chunk.order
      );
    });

    const editedCategories = categoryOrder.filter((cat) => {
      const prevCat = prevCategoryOrder.find(
        (pc) => pc.category === cat.category
      );
      if (!prevCat) return false;
      return prevCat.order !== cat.order;
    });
    return { editedChunks, editedCategories };
  };

  const getNewChunksAndCategories = () => {
    /**
     * Identifies new chunks and categories by comparing current state with previous state.
     * - Used to determine which items need to be added to the database upon saving.
     *
     * @return An object containing arrays of new chunks and new categories.
     */
    const newChunks = chunks.filter(
      (chunk) => !prevChunks.find((pc) => pc.id === chunk.id)
    );

    const newCategories = categoryOrder.filter(
      (cat) => !prevCategoryOrder.find((pc) => pc.category === cat.category)
    );
    return { newChunks, newCategories };
  };

  const isChunksEdited = ({
    deletedChunkIds,
    deletedCategories,
    editedChunks,
    editedCategories,
  }: {
    deletedChunkIds: string[];
    deletedCategories: CategoryOrderData[];
    editedChunks: ProfileChunk[];
    editedCategories: CategoryOrderData[];
  }) => {
    /**
     * Checks if there are any unsaved changes in chunks or category order.
     *
     * @param deletedChunkIds - An array of deleted chunk IDs.
     * @param deletedCategories - An array of deleted categories.
     * @param editedChunks - An array of edited chunks.
     * @param editedCategories - An array of edited categories.
     * @return A boolean indicating whether there are unsaved changes.
     */
    return (
      deletedChunkIds.length > 0 ||
      deletedCategories.length > 0 ||
      editedChunks.length > 0 ||
      editedCategories.length > 0 ||
      prevCategoryOrder.length !== categoryOrder.length
    );
  };

  const deleteChunksFromSupabase = async (
    deletedChunkIds: string[],
    deletedCategories: AllCategories[]
  ) => {
    /**
     * Deletes chunks with the specified IDs from Supabase.
     *
     * @param deletedChunkIds - An array of chunk IDs to be deleted.
     * @param deletedCategories - An array of categories to be deleted.
     */

    if (isVisiting) return;

    // Delete removed categories
    if (deletedCategories.length > 0) {
      const { error: delCatError } = await supabase
        .from("profile_chunk_categories")
        .delete()
        .eq("profile_id", profileId)
        .in("category", deletedCategories);
      if (delCatError) {
        console.error("Error deleting categories:", delCatError);
        throw delCatError;
      }
    }

    // Delete removed chunks
    if (deletedChunkIds.length > 0) {
      const { error: delChunkError } = await supabase
        .from("profile_chunks")
        .delete()
        .eq("profile_id", profileId)
        .in("id", deletedChunkIds);
      if (delChunkError) {
        console.error("Error deleting chunks:", delChunkError);
        throw delChunkError;
      }
    }
  };

  const upsertChunksToSupabase = async ({
    editedChunks,
    editedCategories,
    newChunks,
    newCategories,
  }: {
    editedChunks: ProfileChunk[];
    editedCategories: CategoryOrderData[];
    newChunks: ProfileChunk[];
    newCategories: CategoryOrderData[];
  }) => {
    /**
     * Updates edited chunks in Supabase.
     *
     * @param editedChunks - An array of chunks that have been edited.
     */
    if (!profile) return;

    // Combine edited and new chunks for upsert
    const chunksToUpsert = [...editedChunks, ...newChunks];
    const categoriesToUpsert = [...editedCategories, ...newCategories];

    // Upsert categories
    const { error: categoryError } = await supabase
      .from("profile_chunk_categories")
      .upsert(
        categoriesToUpsert.map((cat, index) => ({
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

    // Upsert chunks
    const { error: chunksError } = await supabase.from("profile_chunks").upsert(
      chunksToUpsert.map((chunk) => ({
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
  };

  const hasChunkChanges = (): boolean => {
    const { deletedChunkIds, deletedCategories } =
      getDeletedChunksAndCategories();
    const { editedChunks, editedCategories } = getEditedChunksAndCategories();
    const { newChunks, newCategories } = getNewChunksAndCategories();

    return (
      deletedChunkIds.length > 0 ||
      deletedCategories.length > 0 ||
      editedChunks.length > 0 ||
      editedCategories.length > 0 ||
      newChunks.length > 0 ||
      newCategories.length > 0 ||
      prevCategoryOrder.length !== categoryOrder.length
    );
  };

  const saveChunks = async () => {
    /**
     * Saves the current chunks and category order to Supabase.
     * - Reads from refs to avoid stale closures in async context.
     * - Identifies deleted, edited, and new chunks and categories.
     * - Performs necessary deletions and upserts to synchronize with the database.
     * - Updates previous state to current state upon successful save.
     * - Updates the profile in the vector store on successful save.
     */
    if (isVisiting) return;

    const { profile, user } = useAuthStore.getState();
    if (!profile || savingChunksRef.current || user?.id !== profile.id) return;
    setSavingChunks(true);
    savingChunksRef.current = true;

    // Read latest values from refs to avoid stale closures
    const currentChunks = chunksRef.current;
    const currentPrevChunks = prevChunksRef.current;
    const currentCategoryOrder = categoryOrderRef.current;
    const currentPrevCategoryOrder = prevCategoryOrderRef.current;

    const deletedChunkIds = currentPrevChunks
      .filter(
        (prevChunk) =>
          !currentChunks.find((chunk) => chunk.id === prevChunk.id)
      )
      .map((chunk) => chunk.id);
    const deletedCategories = currentPrevCategoryOrder.filter(
      (prevCat) =>
        !currentCategoryOrder.find((cat) => cat.category === prevCat.category)
    );

    const editedChunks = currentChunks.filter((chunk) => {
      const prevChunk = currentPrevChunks.find((pc) => pc.id === chunk.id);
      if (!prevChunk) return false;
      return (
        prevChunk.text !== chunk.text ||
        prevChunk.category !== chunk.category ||
        prevChunk.order !== chunk.order
      );
    });
    const editedCategories = currentCategoryOrder.filter((cat) => {
      const prevCat = currentPrevCategoryOrder.find(
        (pc) => pc.category === cat.category
      );
      if (!prevCat) return false;
      return prevCat.order !== cat.order;
    });

    const newChunks = currentChunks.filter(
      (chunk) => !currentPrevChunks.find((pc) => pc.id === chunk.id)
    );
    const newCategories = currentCategoryOrder.filter(
      (cat) =>
        !currentPrevCategoryOrder.find((pc) => pc.category === cat.category)
    );

    // If no changes, skip saving
    const hasChanges =
      deletedChunkIds.length > 0 ||
      deletedCategories.length > 0 ||
      editedChunks.length > 0 ||
      editedCategories.length > 0 ||
      newChunks.length > 0 ||
      newCategories.length > 0 ||
      currentPrevCategoryOrder.length !== currentCategoryOrder.length;

    if (!hasChanges) {
      setSavingChunks(false);
      savingChunksRef.current = false;
      return;
    }

    try {
      // Delete removed chunks and categories
      await deleteChunksFromSupabase(
        deletedChunkIds,
        deletedCategories.map((cat) => cat.category)
      );

      // Upsert edited and new chunks and categories
      await upsertChunksToSupabase({
        editedChunks,
        editedCategories,
        newChunks,
        newCategories,
      });

      // Update prev states to current
      setPrevChunks(currentChunks);
      setPrevCategoryOrder(currentCategoryOrder);

      // save profile to vector store
      await uploadProfileToVectorStore();
    } catch (error) {
      console.error("Failed to save chunks:", error);
    } finally {
      setSavingChunks(false);
      savingChunksRef.current = false;
    }
  };

  return {
    fetchChunks,
    saveChunks,
    hasChunkChanges,
    reset,
    loadingChunks,
    savingChunks,
  };
}

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { AllCategories, CategoryOrderData, ChunkInput } from "../ChunkUtils";
import { useAuthStore } from "@/stores/authStore";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/client";

export interface ProfileChunk {
  id: string;
  text: string;
  category: AllCategories;
  order: number;
}

export interface ChunkEntry {
  id: string;
  text: string;
  order: number;
}

export interface CategoryChunks {
  category: AllCategories;
  chunks: ChunkEntry[];
}

type ChunkContextType = {
  // Display state
  orderedCategoryChunks: CategoryChunks[];

  // Current State
  chunks: ProfileChunk[];
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  // Loading states
  loadingChunks: boolean;
  savingChunks: boolean;
  // Editing states
  editChunks: Record<string, ChunkInput>;
  setEditChunks: React.Dispatch<
    React.SetStateAction<Record<string, ChunkInput>>
  >;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  // Tldr states
  tldr: string;
  editingTldr: boolean;
  setEditingTldr: React.Dispatch<React.SetStateAction<boolean>>;
  newTldr: string;
  setNewTldr: React.Dispatch<React.SetStateAction<string>>;

  // Actions
  addChunk: (category: AllCategories, text: string) => void;
  updateChunk: (id: string, data: Partial<ProfileChunk>) => void;
  removeChunk: (id: string) => void;
  moveCategory: (fromIndex: number, toIndex: number) => void;
  moveChunk: (
    category: AllCategories,
    fromIndex: number,
    toIndex: number
  ) => void;
  reset: () => void;

  // Data operations
  fetchChunks: () => Promise<void>;
  saveChunks: () => Promise<void>;
};

const ChunkContext = createContext<ChunkContextType | undefined>(undefined);

export function ChunkProvider({ children }: { children: ReactNode }) {
  const [chunks, setChunks] = useState<ProfileChunk[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrderData[]>([]);
  const { profile, getSupabaseClient, updateProfile } = useAuthStore.getState();
  const [editChunks, setEditChunks] = useState<Record<string, ChunkInput>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tldr, setTldr] = useState<string>("");
  const [editingTldr, setEditingTldr] = useState<boolean>(false);
  const [newTldr, setNewTldr] = useState<string>("");

  // loading states
  const [loadingChunks, setLoadingChunks] = useState<boolean>(true);
  const [savingChunks, setSavingChunks] = useState<boolean>(false);

  // Track last fetched state to identify deleted chunks/categories
  const [prevChunks, setPrevChunks] = useState<ProfileChunk[]>([]);
  const [prevCategoryOrder, setPrevCategoryOrder] = useState<
    CategoryOrderData[]
  >([]);

  const supabase = getSupabaseClient();

  // set categoryChunks map based on category and chunk orders
  const orderedCategoryChunks = useMemo(() => {
    return categoryOrder.map(({ category }) => ({
      category,
      chunks: chunks
        .filter((chunk) => chunk.category === category)
        .sort((a, b) => a.order - b.order)
        .map((chunk) => ({
          id: chunk.id,
          text: chunk.text,
          order: chunk.order,
        })),
    }));
  }, [categoryOrder, chunks]);

  // When chunks update if a category has no chunks remove it from categoryOrder
  useEffect(() => {
    const usedCategories = new Set(chunks.map((chunk) => chunk.category));
    setCategoryOrder((prev) =>
      prev.filter((cat) => usedCategories.has(cat.category))
    );
  }, [chunks]);

  // Add a new chunk
  const addChunk = (category: AllCategories, text: string) => {
    if (!profile) return;

    // Check if category exists if not add it
    if (!categoryOrder.find((cat) => cat.category === category)) {
      setCategoryOrder((prev) => [
        ...prev,
        { profile_id: profile.id, category, order: prev.length },
      ]);
    }

    // Add new chunk and set its order within the category to the end
    setChunks((prev) => {
      const categoryChunks = prev.filter(
        (chunk) => chunk.category === category
      );
      const newChunk: ProfileChunk = {
        id: crypto.randomUUID(),
        text: text,
        category,
        order: categoryChunks.length,
      };
      return [...prev, newChunk];
    });
  };

  // Update chunk by Id
  const updateChunk = (id: string, data: Partial<ProfileChunk>) => {
    setChunks((prev) =>
      prev.map((chunk) => (chunk.id === id ? { ...chunk, ...data } : chunk))
    );
  };

  const removeChunk = (id: string) => {
    setChunks((prev) => prev.filter((chunk) => chunk.id !== id));
  };

  // Move Logic
  const moveCategory = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setCategoryOrder((prev) => {
      const updated = Array.from(prev);
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((cat, index) => ({
        ...cat,
        order: index,
      }));
    });
  };

  const moveChunk = (
    category: AllCategories,
    fromIndex: number,
    toIndex: number
  ) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    setChunks((prev) => {
      const categoryChunks = prev.filter(
        (chunk) => chunk.category === category
      );
      // Check indices are within bounds
      if (
        fromIndex >= categoryChunks.length ||
        toIndex >= categoryChunks.length
      )
        return prev;

      const updated = Array.from(categoryChunks);
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      // Update orders
      const reordered = updated.map((chunk, index) => ({
        ...chunk,
        order: index,
      }));
      // Merge back with other chunks
      const otherChunks = prev.filter((chunk) => chunk.category !== category);
      return [...otherChunks, ...reordered];
    });
  };

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

      // Fetch and set tldr
      setTldr(profile.tldr || "");
    } catch (error) {
      console.error("Failed to load chunks:", error);
    } finally {
      setLoadingChunks(false);
    }
  }, [profile, supabase]);

  // Reset chunks to last fetched state and reset tldr
  const reset = () => {
    setChunks(prevChunks);
    setCategoryOrder(prevCategoryOrder);
    setNewTldr(tldr);
    setEditingTldr(false);
  };

  const saveChunks = async () => {
    if (!profile || savingChunks) return;
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

      // Save tldr if edited
      saveTldr();

      // save profile to vector store
      await uploadProfileToVectorStore();
    } catch (error) {
      console.error("Failed to save chunks:", error);
    } finally {
      setSavingChunks(false);
    }
  };

  const saveTldr = async () => {
    if (!profile) return;
    setSavingChunks(true);
    updateProfile({ tldr: newTldr });
    setSavingChunks(false);
  };

  return (
    <ChunkContext.Provider
      value={{
        // States
        chunks,
        setChunks,
        orderedCategoryChunks,
        loadingChunks,
        savingChunks,
        editChunks,
        setEditChunks,
        isEditing,
        setIsEditing,
        // Tldr states
        tldr,
        editingTldr,
        setEditingTldr,
        newTldr,
        setNewTldr,
        // Actions
        addChunk,
        updateChunk,
        removeChunk,
        reset,
        // Moving
        moveChunk,
        moveCategory,
        // Data operations
        fetchChunks,
        saveChunks,
      }}
    >
      {children}
    </ChunkContext.Provider>
  );
}

export function useChunkContext() {
  const ctx = useContext(ChunkContext);
  if (!ctx)
    throw new Error("useChunkContext must be used within a ChunkProvider");
  return ctx;
}

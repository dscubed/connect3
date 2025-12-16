import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { AllCategories, CategoryOrderData } from "../ChunkUtils";
import { useAuthStore } from "@/stores/authStore";

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
  chunks: ProfileChunk[];
  orderedCategoryChunks: CategoryChunks[];
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  addChunk: (category: AllCategories, text: string) => void;
  updateChunk: (id: string, data: Partial<ProfileChunk>) => void;
  removeChunk: (id: string) => void;
  moveCategory: (fromIndex: number, toIndex: number) => void;
  moveChunk: (
    category: AllCategories,
    fromIndex: number,
    toIndex: number
  ) => void;
  loadingChunks: boolean;
  savingChunks: boolean;
  fetchChunks: () => Promise<void>;
  saveChunks: () => Promise<void>;
};

const ChunkContext = createContext<ChunkContextType | undefined>(undefined);

export function ChunkProvider({ children }: { children: ReactNode }) {
  const [chunks, setChunks] = useState<ProfileChunk[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrderData[]>([]);
  const { profile, getSupabaseClient } = useAuthStore.getState();
  const [loadingChunks, setLoadingChunks] = useState<boolean>(true);
  const [savingChunks, setSavingChunks] = useState<boolean>(false);

  const supabase = getSupabaseClient();

  // Initialise categoryChunks map based on category and chunk orders
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

  const updateChunk = (id: string, data: Partial<ProfileChunk>) => {
    // Update chunk by id
    setChunks((prev) =>
      prev.map((chunk) => (chunk.id === id ? { ...chunk, ...data } : chunk))
    );
  };

  const removeChunk = (id: string) => {
    setChunks((prev) => prev.filter((chunk) => chunk.id !== id));
  };

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

  const fetchChunks = useCallback(async () => {
    setLoadingChunks(true);

    try {
      if (!profile || loadingChunks) return;
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

      setChunks(chunksData as ProfileChunk[]);
      setCategoryOrder(categoryOrderData as CategoryOrderData[]);
    } catch (error) {
      console.error("Failed to load chunks:", error);
    } finally {
      setLoadingChunks(false);
    }
  }, [profile, supabase, loadingChunks]);

  const saveChunks = async () => {
    if (!profile) return;
    setSavingChunks(true);
    try {
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
    } catch (error) {
      console.error("Failed to save chunks:", error);
    } finally {
      setSavingChunks(false);
    }
  };

  return (
    <ChunkContext.Provider
      value={{
        chunks,
        setChunks,
        addChunk,
        updateChunk,
        removeChunk,
        moveCategory,
        moveChunk,
        orderedCategoryChunks,
        loadingChunks,
        savingChunks,
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

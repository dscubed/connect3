import { create } from "zustand";
import { useAuthStore } from "../authStore";
import type { ChunkData } from "@/components/profile/chunks/ChunkUtils";
import { validateChunk } from "@/lib/onboarding/validation/validateChunk";
import { toast } from "sonner";

interface ProfileChunkStore {
  chunks: ChunkData[];
  groupedChunks: Record<string, ChunkData[]>;
  categories: string[];
  expandedCategories: Set<string>;
  addingChunks: Record<string, { text: string; loading: boolean }>;
  deleting: Record<string, boolean>;
  loading: boolean;
  addingCategory: { category: string; chunk: string; loading: boolean };
  setAddingCategory: (adding: {
    category: string;
    chunk: string;
    loading: boolean;
  }) => void;
  addCategory: (category: string, chunkText: string) => Promise<void>;

  setChunks: (chunks: ChunkData[]) => void;
  setGroupedChunks: (grouped: Record<string, ChunkData[]>) => void;
  setCategories: (cats: string[]) => void;
  setExpandedCategories: (expanded: Set<string>) => void;
  setAddingChunks: (
    adding: Record<string, { text: string; loading: boolean }>
  ) => void;
  setLoading: (loading: boolean) => void;
  setDeleting: (deleting: Record<string, boolean>) => void;

  addChunk: (params: {
    category: string;
    summary_text: string;
  }) => Promise<void>;
  deleteChunk: (chunkId: string) => Promise<void>;
  updateChunk: (chunkId: string, updates: Partial<ChunkData>) => Promise<void>;
}

export const useProfileChunkStore = create<ProfileChunkStore>((set) => ({
  chunks: [],
  groupedChunks: {},
  categories: [],
  expandedCategories: new Set(),
  addingChunks: {},
  deleting: {},
  loading: false,

  setChunks: (chunks) => set({ chunks }),
  setGroupedChunks: (grouped) => set({ groupedChunks: grouped }),
  setCategories: (cats) => set({ categories: cats }),
  setExpandedCategories: (expanded) => set({ expandedCategories: expanded }),
  setAddingChunks: (adding) => set({ addingChunks: adding }),
  setDeleting: (deleting) => set({ deleting }),
  setLoading: (loading) => set({ loading }),
  addingCategory: { category: "", chunk: "", loading: false },
  setAddingCategory: (adding) => set({ addingCategory: adding }),

  addChunk: async ({ category, summary_text }) => {
    const { user, makeAuthenticatedRequest, getSupabaseClient } =
      useAuthStore.getState();
    if (!user) throw new Error("User not authenticated");

    const isValid = await validateChunk({
      chunk_id: "",
      category,
      content: summary_text,
    });
    if (!isValid) {
      set((state) => {
        const next = { ...state.addingChunks };
        delete next[category];
        return { addingChunks: next };
      });
      return;
    }

    const supabase = getSupabaseClient();
    console.log("Adding chunk in category", category, summary_text);
    const response = await supabase
      .from("user_files")
      .insert([
        {
          user_id: user.id,
          category: category,
          summary_text: summary_text,
          status: "pending",
        },
      ])
      .select("id")
      .single();
    console.log("Insert response:", response);

    await makeAuthenticatedRequest("/api/profiles/uploadChunk", {
      method: "POST",
      body: JSON.stringify({
        rowId: response.data?.id,
        userId: user.id,
        category: category,
        text: summary_text,
      }),
    });

     // Auto-generate TLDR after adding a chunk
     await makeAuthenticatedRequest("/api/profiles/auto-generate-tldr", {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });
  

    set((state) => {
      const next = { ...state.addingChunks };
      delete next[category];
      return { addingChunks: next };
    });
  },

  updateChunk: async (chunkId: string, updates: Partial<ChunkData>) => {
    const { getSupabaseClient, user } = useAuthStore.getState();
    if (!user) throw new Error("User not authenticated");
    const supabase = getSupabaseClient();

    const response = await supabase
      .from("user_files")
      .update(updates)
      .eq("id", chunkId)
      .select()
      .single();
    console.log("Update response:", response);

    if (response.error) {
      toast.error(`Error updating chunk: ${response.error.message}`);
      return;
    }
  },

  deleteChunk: async (chunkId: string) => {
    const { user, makeAuthenticatedRequest } = useAuthStore.getState();
    if (!user) throw new Error("User not authenticated");

    set((state) => ({
      deleting: { ...state.deleting, [chunkId]: true },
    }));

    try {
      const res = await makeAuthenticatedRequest(
        `/api/vector-store/deleteChunk/${chunkId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (result.success) {
        // Remove chunk from store
        set((state) => ({
          chunks: state.chunks.filter((chunk) => chunk.id !== chunkId),
          deleting: { ...state.deleting, [chunkId]: false },
        }));

        // Auto-generate TLDR after deletion
        await makeAuthenticatedRequest("/api/profiles/auto-generate-tldr", {
          method: "POST",
          body: JSON.stringify({ userId: user.id }),
        });
  
      } else {
        // Deletion failed, clear deleting state
        set((state) => {
          const next = { ...state.deleting };
          delete next[chunkId];
          return { deleting: next };
        });
      }
    } catch (error) {
      console.error("Error deleting chunk:", error);
      set((state) => {
        const next = { ...state.deleting };
        delete next[chunkId];
        return { deleting: next };
      });
    }
  },

  addCategory: async (category: string, chunkText: string) => {
    set({ addingCategory: { category, chunk: chunkText, loading: true } });

    // TODO: Implement backend logic for adding the first chunk here
    await useProfileChunkStore
      .getState()
      .addChunk({ category, summary_text: chunkText });

    set({ addingCategory: { category: "", chunk: "", loading: false } });
  },
}));

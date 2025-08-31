import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

// Define the profile type
interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

let authListenerUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error("Initialize error:", error);
      set({ user: null, profile: null, loading: false });
    }

    // Clean up previous listener before adding a new one
    if (authListenerUnsubscribe) {
      authListenerUnsubscribe();
    }
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const newUser = session?.user ?? null;

        if (newUser) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newUser.id)
            .single();

          if (profileError) {
            console.error(
              "Profile fetch error (onAuthStateChange):",
              profileError
            );
          }

          set({ user: newUser, profile, loading: false });
        } else {
          set({ user: null, profile: null, loading: false });
        }
      }
    );
    authListenerUnsubscribe = listener?.unsubscribe;
  },

  signOut: async () => {
    console.log("signOut called!");
    const supabase = createClient();
    console.log("client created!");

    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error("No authenticated user");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      set({ profile: data });
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    set({ profile });
  },
}));

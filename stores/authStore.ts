import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  name_provided: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (fields: Partial<Profile>) => Promise<void>; // Add this
}

async function fetchProfile(
  userId: string,
  set: (state: Partial<AuthState>) => void
) {
  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!error)
    set({ profile }); // onboarding_completed will be included automatically
  else set({ profile: null });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const supabase = createClient();

    // Get initial user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user, loading: false });
    if (user) {
      fetchProfile(user.id, set);
    } else {
      set({ profile: null });
    }

    // Listen for changes
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null, loading: false });
      if (session?.user) {
        fetchProfile(session.user.id, set);
      } else {
        set({ profile: null });
      }
    });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (fields) => {
    const supabase = createClient();
    const userId = get().user?.id;
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .update(fields)
      .eq("id", userId);
    if (!error) {
      // Update local profile state
      set({ profile: { ...get().profile!, ...fields } });
    }
  },
}));

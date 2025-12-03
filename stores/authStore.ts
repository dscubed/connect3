import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  blurred_avatar_url?: string;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  name_provided: boolean;
  location?: string;
  tldr?: string;
  cover_image_url?: string;
  status?: string;
  account_type?: "user" | "organisation";
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  session: Session | null;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (fields: Partial<Profile>) => Promise<void>;
  makeAuthenticatedRequest: (
    url: string,
    options?: RequestInit
  ) => Promise<Response>;
  getSupabaseClient: () => ReturnType<typeof createClient>;
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
  if (!error) set({ profile });
  else set({ profile: null });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  session: null,

  initialize: async () => {
    const supabase = createClient();

    // Get initial session and user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isAnon = session?.user?.is_anonymous ?? false;

    set({ user: session?.user ?? null, session, loading: false });

    if (session?.user && !isAnon) {
      fetchProfile(session.user.id, set);
    } else {
      set({ profile: null });
    }

    // Listen for changes
    supabase.auth.onAuthStateChange((event, session) => {
      const isAnon = session?.user?.is_anonymous ?? false;
      set({ user: session?.user ?? null, session, loading: false });
      if (session?.user && !isAnon) {
        fetchProfile(session.user.id, set);
      } else {
        set({ profile: null });
      }
    });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
  },

  updateProfile: async (fields) => {
    const supabase = createClient();
    const userId = get().user?.id;
    if (!userId) return;

    const updateData = {
      ...fields,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (!error) {
      set({ profile: { ...get().profile!, ...updateData } });
    }
  },

  makeAuthenticatedRequest: async (url: string, options: RequestInit = {}) => {
    const { session } = get();

    if (!session?.access_token) {
      throw new Error("Authentication required. Please log in.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      get().signOut();
      console.error("Authentication failed. Please log in again.");
      throw new Error("Authentication failed. Please log in again.");
    }

    return response;
  },

  getSupabaseClient: () => {
    return createClient();
  },
}));

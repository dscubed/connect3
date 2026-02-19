"use client";
import React, { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { Profile, useAuthStore } from "@/stores/authStore";
import { ProfilePageSkeleton } from "./ProfilePageSkeleton";

interface ProfileContextType {
  profile: Profile;
  isLoading: boolean;
  isOwnProfile: boolean;
  profileId: string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  profileId: string;
  /** If provided, skip fetching and use this profile directly */
  initialProfile?: Profile;
}

export function ProfileProvider({
  children,
  profileId,
  initialProfile,
}: ProfileProviderProps) {
  const authUser = useAuthStore((state) => state.user);
  const authProfile = useAuthStore((state) => state.profile);
  const getSupabaseClient = useAuthStore((state) => state.getSupabaseClient);

  const isOwnProfile = authUser?.id === profileId;

  // Use initialProfile or authProfile when applicable - skip fetch
  const useInitialData =
    (initialProfile?.id === profileId) || (isOwnProfile && !!authProfile);

  const swrKey = !useInitialData ? `profile_full_${profileId}` : null;
  const { data: fetchedProfile, isLoading: isFetching, error } = useSWR<Profile>(
    swrKey,
    async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
      if (error) throw error;
      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const profile = useInitialData
    ? (initialProfile?.id === profileId ? initialProfile! : authProfile!)
    : fetchedProfile;
  const isLoading = useInitialData ? false : isFetching;

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <p className="text-muted">Profile not found.</p>
      </div>
    );
  }

  return (
    <ProfileContext.Provider
      value={{ profile, isLoading, isOwnProfile, profileId }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return ctx;
}

"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { Profile, useAuthStore } from "@/stores/authStore";
import { useProfile } from "@/lib/profiles/fetchProfile";
import { ProfilePageSkeleton } from "./ProfilePageSkeleton";
import { LinkType } from "./links/LinksUtils";

// ─── Types matching the profile_detail view ─────────────────────

export interface ProfileDetailLink {
  id: string;
  type: LinkType;
  details: string;
  created_at: string;
}

export interface ProfileDetailChunkItem {
  id: string;
  text: string;
  order: number;
  created_at: string;
}

export interface ProfileDetailChunkCategory {
  category: string;
  order: number;
  chunks: ProfileDetailChunkItem[] | null;
}

/** Full profile with embedded links and chunks from the profile_detail view */
export interface ProfileDetail extends Profile {
  links?: ProfileDetailLink[];
  chunks?: ProfileDetailChunkCategory[];
}

// ─── Context ────────────────────────────────────────────────────

interface ProfileContextType {
  profile: ProfileDetail;
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

  const isOwnProfile = authUser?.id === profileId;

  // Use initialProfile or authProfile when applicable - skip fetch
  const useInitialData =
    initialProfile?.id === profileId || (isOwnProfile && !!authProfile);

  // Fetch from profile_detail view to get links + chunks in a single query
  const {
    data: fetchedProfile,
    isLoading: isFetching,
    error,
  } = useProfile<ProfileDetail>(useInitialData ? null : profileId, {
    table: "profile_detail",
  });

  const profile: ProfileDetail | null | undefined = useInitialData
    ? initialProfile?.id === profileId
      ? initialProfile!
      : authProfile!
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

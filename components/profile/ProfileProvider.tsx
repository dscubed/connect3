"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Profile, useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";

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

  const [profile, setProfile] = useState<Profile | null>(
    initialProfile ?? null
  );
  const [isLoading, setIsLoading] = useState(!initialProfile);

  // Track current profileId to handle race conditions
  const currentProfileIdRef = useRef<string>(profileId);

  const isOwnProfile = authUser?.id === profileId;

  useEffect(() => {
    // Update ref immediately when profileId changes
    currentProfileIdRef.current = profileId;

    // If we have an initial profile that matches, use it
    if (initialProfile && initialProfile.id === profileId) {
      setProfile(initialProfile);
      setIsLoading(false);
      return;
    }

    // If viewing own profile, use cached auth profile
    if (isOwnProfile && authProfile) {
      setProfile(authProfile);
      setIsLoading(false);
      return;
    }

    // Fetch profile for visiting
    const fetchProfile = async () => {
      setIsLoading(true);
      setProfile(null); // Clear immediately to prevent stale data

      const fetchingForId = profileId;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", fetchingForId)
          .single();

        if (error) throw error;

        // Only apply if still current profile
        if (currentProfileIdRef.current === fetchingForId) {
          console.log("ProfileProvider: Setting profile for", fetchingForId);
          setProfile(data);
        } else {
          console.log(
            "ProfileProvider: Discarding stale fetch for",
            fetchingForId,
            "current is",
            currentProfileIdRef.current
          );
        }
      } catch (error) {
        console.error("ProfileProvider: Failed to fetch profile:", error);
      } finally {
        if (currentProfileIdRef.current === fetchingForId) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [profileId, isOwnProfile, authProfile, getSupabaseClient, initialProfile]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="flex items-center gap-4">
          <CubeLoader size={32} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!profile) {
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

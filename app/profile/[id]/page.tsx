"use client";
import { Profile, useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ProfilePageContent } from "../ProfilePageContent";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const { id } = useParams();
  const EDITING_PROFILE_VISITOR = false;
  const SET_EDITING_PROFILE_VISITOR = () => {};
  const { getSupabaseClient } = useAuthStore();
  const supabase = getSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data from page id param on mount
  useEffect(() => {
    const fetchProfile = async () => {
      console.log("Fetching profile for id:", id);
      if (!id) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <CubeLoader size={32} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <ProfilePageContent
      editingProfile={EDITING_PROFILE_VISITOR}
      setEditingProfile={SET_EDITING_PROFILE_VISITOR}
      profile={profile}
    />
  );
}

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useClubStore } from "@/stores/clubStore";

async function fetchMyClubs() {
  try {
    const res = await fetch("/api/clubs/my-clubs");
    if (!res.ok) return [];
    const { data } = await res.json();
    return data ?? [];
  } catch {
    return [];
  }
}

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const setClubs = useClubStore((s) => s.setClubs);
  const setActiveClubId = useClubStore((s) => s.setActiveClubId);
  const setClubsLoading = useClubStore((s) => s.setClubsLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setClubs([]);
      setActiveClubId(null);
      setClubsLoading(false);
      return;
    }
    setClubsLoading(true);
    fetchMyClubs().then((clubs) => {
      setClubs(clubs);
      if (clubs.length > 0) setActiveClubId(clubs[0].club_id);
      setClubsLoading(false);
    });
  }, [user, loading, setClubs, setActiveClubId, setClubsLoading]);

  return null;
}

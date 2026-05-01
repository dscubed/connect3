import { create } from "zustand";

export interface ClubProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
}

export interface ClubAdminRow {
  id: string;
  club_id: string;
  role: string;
  status: string;
  created_at: string;
  club: ClubProfile | null;
}

interface ClubState {
  clubs: ClubAdminRow[];
  activeClubId: string | null;
  clubsLoading: boolean;
  setClubs: (clubs: ClubAdminRow[]) => void;
  setActiveClubId: (id: string | null) => void;
  setClubsLoading: (loading: boolean) => void;
  getActiveClub: () => ClubAdminRow | null;
}

export const useClubStore = create<ClubState>((set, get) => ({
  clubs: [],
  activeClubId: null,
  clubsLoading: true,
  setClubs: (clubs) => set({ clubs }),
  setActiveClubId: (id) => set({ activeClubId: id }),
  setClubsLoading: (loading) => set({ clubsLoading: loading }),
  getActiveClub: () => {
    const { clubs, activeClubId } = get();
    return clubs.find((c) => c.club_id === activeClubId) ?? null;
  },
}));

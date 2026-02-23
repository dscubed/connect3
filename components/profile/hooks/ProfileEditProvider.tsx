"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuthStore, Profile } from "@/stores/authStore";
import {
  addLinksToSupabase,
  deleteLinksFromSupabase,
  LinkItem,
  LinkType,
  updateLinksInSupabase,
} from "@/components/profile/links/LinksUtils";
import { University } from "@/components/profile/details/univeristies";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";
import { fetchProfile } from "@/lib/profiles/fetchProfile";
import type { ProfileDetailLink } from "@/components/profile/ProfileProvider";

export type ResumeProfileDetails = {
  tldr?: string | null;
  universityKey?: University | null;
  links?: { type: LinkType; details: string }[];
};

export type ProfileDraft = {
  profileId: string;
  first_name: string;
  last_name: string | null;
  tldr: string;
  university: University | null;
  links: LinkItem[];
};

type ProfileDraftFields = Omit<ProfileDraft, "profileId" | "links">;

type ProfileEditContextType = {
  draft: ProfileDraft | null;
  baseline: ProfileDraft | null;
  loadingLinks: boolean;
  savingProfileEdits: boolean;
  setDraftFields: (fields: Partial<ProfileDraftFields>) => void;
  setDraftLinks: (links: LinkItem[]) => void;
  applyResumeDetails: (details?: ResumeProfileDetails | null) => void;
  resetDraft: () => void;
  hasPendingProfileEdits: () => boolean;
  saveProfileEdits: () => Promise<void>;
};

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(
  undefined,
);

const buildDraft = (profile: Profile, links: LinkItem[]): ProfileDraft => ({
  profileId: profile.id,
  first_name: profile.first_name ?? "",
  last_name: profile.last_name ?? null,
  tldr: profile.tldr ?? "",
  university: (profile.university as University) ?? null,
  links,
});

const linksEqual = (a: LinkItem[], b: LinkItem[]) => {
  if (a.length !== b.length) return false;
  return a.every((link, idx) => {
    const other = b[idx];
    if (!other) return false;
    return (
      link.id === other.id &&
      link.type === other.type &&
      link.details === other.details
    );
  });
};

export function ProfileEditProvider({
  profile,
  editingProfile,
  children,
}: {
  profile: Profile;
  editingProfile: boolean;
  children: React.ReactNode;
}) {
  const { user, updateProfile, getSupabaseClient } = useAuthStore();
  const supabase = getSupabaseClient();

  const [baseline, setBaseline] = useState<ProfileDraft | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [loadingLinks, setLoadingLinks] = useState<boolean>(true);
  const initialLinksLoadedRef = useRef(false);
  const pendingResumeDetailsRef = useRef<ResumeProfileDetails | null>(null);
  const [savingProfileEdits, setSavingProfileEdits] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const seedLinks = baseline?.profileId === profile.id ? baseline.links : [];
    const nextBase = buildDraft(profile, seedLinks);
    setBaseline(nextBase);
    setDraft((prev) => {
      if (!prev || prev.profileId !== profile.id || !editingProfile) {
        return nextBase;
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, editingProfile]);

  useEffect(() => {
    let cancelled = false;
    const fetchLinks = async () => {
      if (!profile?.id) return;
      setLoadingLinks(true);
      initialLinksLoadedRef.current = false;

      const result = await fetchProfile<{ links: ProfileDetailLink[] }>(
        profile.id,
        { table: "profile_detail", select: "links" },
      );

      if (cancelled) return;

      if (!result) {
        console.error("Error fetching links from profile_detail");
        setLoadingLinks(false);
        initialLinksLoadedRef.current = true;
        return;
      }

      const links: LinkItem[] = (result.links ?? []).map((l) => ({
        id: l.id,
        type: l.type,
        details: l.details,
      }));
      const nextBase = buildDraft(profile, links);
      setBaseline(nextBase);
      setDraft((prev) => {
        if (!prev || prev.profileId !== profile.id || !editingProfile) {
          return nextBase;
        }
        if (!initialLinksLoadedRef.current && prev.links.length === 0) {
          return { ...prev, links };
        }
        return prev;
      });
      setLoadingLinks(false);
      initialLinksLoadedRef.current = true;
    };

    fetchLinks();

    return () => {
      cancelled = true;
    };
    // Only re-fetch when profile changes, NOT when editingProfile toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    if (!baseline) return;
    if (!editingProfile) {
      setDraft(baseline);
    } else if (!draft || draft.profileId !== baseline.profileId) {
      setDraft(baseline);
    }
  }, [baseline, editingProfile, draft]);

  const setDraftFields = (fields: Partial<ProfileDraftFields>) => {
    setDraft((prev) => {
      if (!prev) {
        if (!profile) return prev;
        const seedLinks =
          baseline?.profileId === profile.id ? baseline.links : [];
        return { ...buildDraft(profile, seedLinks), ...fields };
      }
      return { ...prev, ...fields };
    });
  };

  const setDraftLinks = (links: LinkItem[]) => {
    setDraft((prev) => {
      if (!prev) {
        if (!profile) return prev;
        const seedLinks =
          baseline?.profileId === profile.id ? baseline.links : [];
        return { ...buildDraft(profile, seedLinks), links };
      }
      return { ...prev, links };
    });
  };

  const applyResumeDetails = (details?: ResumeProfileDetails | null) => {
    if (!details || !baseline) return;
    if (loadingLinks && details.links?.length) {
      pendingResumeDetailsRef.current = details;
    }
    const detailsForNow = loadingLinks ? { ...details, links: [] } : details;
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev };

      if (
        !baseline.tldr.trim() &&
        !prev.tldr.trim() &&
        detailsForNow.tldr?.trim()
      ) {
        next.tldr = detailsForNow.tldr.trim();
      }

      if (
        !baseline.university &&
        !prev.university &&
        detailsForNow.universityKey
      ) {
        next.university = detailsForNow.universityKey;
      }

      // Merge new links from resume: add any that are not already in the draft (by type + details)
      if (!loadingLinks && detailsForNow.links?.length) {
        const existingKeys = new Set(
          prev.links.map((l) => `${l.type}:${l.details.toLowerCase().trim()}`),
        );
        const newLinks = detailsForNow.links
          .filter(
            (link) =>
              !existingKeys.has(
                `${link.type}:${link.details.toLowerCase().trim()}`,
              ),
          )
          .map((link) => ({
            id: crypto.randomUUID(),
            type: link.type,
            details: link.details,
          }));
        if (newLinks.length > 0) {
          next.links = [...prev.links, ...newLinks];
        }
      }

      return next;
    });
  };

  useEffect(() => {
    if (loadingLinks) return;
    const pending = pendingResumeDetailsRef.current;
    if (!pending) return;
    pendingResumeDetailsRef.current = null;
    applyResumeDetails(pending);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingLinks]);

  const resetDraft = () => {
    if (!baseline) return;
    setDraft(baseline);
  };

  const hasPendingProfileEdits = () => {
    if (!baseline || !draft) return false;
    return (
      baseline.first_name !== draft.first_name ||
      baseline.last_name !== draft.last_name ||
      baseline.tldr !== draft.tldr ||
      baseline.university !== draft.university ||
      !linksEqual(baseline.links, draft.links)
    );
  };

  const saveProfileEdits = async () => {
    if (!baseline || !draft) return;
    if (!user || user.id !== profile.id) return;
    if (!hasPendingProfileEdits() || savingProfileEdits) return;

    setSavingProfileEdits(true);

    try {
      const profileUpdates: Partial<Profile> = {};
      if (baseline.first_name !== draft.first_name) {
        profileUpdates.first_name = draft.first_name;
      }
      if (baseline.last_name !== draft.last_name) {
        profileUpdates.last_name = draft.last_name;
      }
      if (baseline.tldr !== draft.tldr) {
        profileUpdates.tldr = draft.tldr;
      }
      if (baseline.university !== draft.university) {
        profileUpdates.university = draft.university;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(profileUpdates);
      }

      const deletedLinks = baseline.links.filter(
        (link) => !draft.links.find((next) => next.id === link.id),
      );
      const newLinks = draft.links.filter(
        (link) => !baseline.links.find((prev) => prev.id === link.id),
      );
      const updatedLinks = draft.links.filter((link) => {
        const prev = baseline.links.find((item) => item.id === link.id);
        if (!prev) return false;
        return prev.details !== link.details || prev.type !== link.type;
      });

      if (deletedLinks.length > 0) {
        await deleteLinksFromSupabase(
          deletedLinks.map((link) => link.id),
          supabase,
        );
      }
      if (newLinks.length > 0) {
        await addLinksToSupabase(newLinks, supabase, profile.id);
      }
      if (updatedLinks.length > 0) {
        await updateLinksInSupabase(updatedLinks, supabase);
      }

      if (
        Object.keys(profileUpdates).length > 0 ||
        deletedLinks.length > 0 ||
        newLinks.length > 0 ||
        updatedLinks.length > 0
      ) {
        await uploadProfileToVectorStore();
      }

      setBaseline(draft);
      setDraft(draft);
    } finally {
      setSavingProfileEdits(false);
    }
  };

  return (
    <ProfileEditContext.Provider
      value={{
        draft,
        baseline,
        loadingLinks,
        savingProfileEdits,
        setDraftFields,
        setDraftLinks,
        applyResumeDetails,
        resetDraft,
        hasPendingProfileEdits,
        saveProfileEdits,
      }}
    >
      {children}
    </ProfileEditContext.Provider>
  );
}

export function useProfileEditContext() {
  const ctx = useContext(ProfileEditContext);
  if (!ctx) {
    throw new Error(
      "useProfileEditContext must be used within a ProfileEditProvider",
    );
  }
  return ctx;
}

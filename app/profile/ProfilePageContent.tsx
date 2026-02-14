import { motion } from "framer-motion";
import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import ChunksSection from "@/components/profile/ChunksSection";
import { ChunkProvider } from "@/components/profile/chunks/hooks/ChunkProvider";
import { LinksSection } from "@/components/profile/LinksSection";
import { ActionsButton } from "@/components/profile/ActionsButton";
import { Profile } from "@/stores/authStore";
import { SummaryCard } from "@/components/profile/SummaryCard";
import {
  ProfileProvider,
  useProfileContext,
} from "@/components/profile/ProfileProvider";

interface ProfilePageContentProps {
  editingProfile: boolean;
  setEditingProfile: (editing: boolean) => void;
  /** Pass profileId to fetch, or pass profile directly if already loaded */
  profileId?: string;
  profile?: Profile;
}

export function ProfilePageContent({
  editingProfile,
  setEditingProfile,
  profileId,
  profile: initialProfile,
}: ProfilePageContentProps) {
  // Determine the profileId to use
  const id = profileId ?? initialProfile?.id;

  if (!id) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <p className="text-muted">No profile ID provided.</p>
      </div>
    );
  }

  return (
    <ProfileProvider profileId={id} initialProfile={initialProfile}>
      <ProfilePageContentInner
        editingProfile={editingProfile}
        setEditingProfile={setEditingProfile}
      />
    </ProfileProvider>
  );
}

function ProfilePageContentInner({
  editingProfile,
  setEditingProfile,
}: {
  editingProfile: boolean;
  setEditingProfile: (editing: boolean) => void;
}) {
  const { profile } = useProfileContext();

  return (
    <div
      className="h-[100dvh] w-full max-w-[100vw] overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.3) transparent",
      }}
    >
      <CoverImage editingProfile={editingProfile} />

      <ChunkProvider isEditing={editingProfile} visitingProfileId={profile.id}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="relative -mt-20 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between">
                <ProfilePicture
                  avatar={profile.avatar_url}
                  editingProfile={editingProfile}
                />
                <ActionsButton
                  profile={profile}
                  setEditingProfile={setEditingProfile}
                  editingProfile={editingProfile}
                />
              </div>
              <div className="flex flex-col">
                <UserDetails
                  profile={profile}
                  editingProfile={editingProfile}
                />
                <LinksSection
                  editingProfile={editingProfile}
                  profile={profile}
                />
              </div>
            </div>
          </motion.div>
          <SummaryCard editingProfile={editingProfile} profile={profile} />

          {/* Chunks Section */}
          <ChunksSection editingProfile={editingProfile} />
        </div>
      </ChunkProvider>
    </div>
  );
}

import CoverImage from "@/components/profile/CoverImage";
import ProfilePicture from "@/components/profile/ProfilePicture";
import UserDetails from "@/components/profile/UserDetails";
import ChunksSection from "@/components/profile/ChunksSection";
import { ChunkProvider } from "@/components/profile/chunks/hooks/ChunkProvider";
import { useChunkContext } from "@/components/profile/chunks/hooks/ChunkProvider";
import { ChunkSkeleton } from "@/components/profile/chunks/display/ChunkSkeleton";
import { LinksSection } from "@/components/profile/LinksSection";
import { ActionsButton } from "@/components/profile/ActionsButton";
import { Profile } from "@/stores/authStore";
import { SummaryCard } from "@/components/profile/SummaryCard";
import { ProfileEditProvider } from "@/components/profile/hooks/ProfileEditProvider";
import {
  ProfileProvider,
  useProfileContext,
} from "@/components/profile/ProfileProvider";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <ProfileEditProvider profile={profile} editingProfile={editingProfile}>
      <ChunkProvider
        isEditing={editingProfile}
        visitingProfileId={profile.id}
        initialChunks={profile.chunks}
      >
        <ProfilePageContentBody
          editingProfile={editingProfile}
          setEditingProfile={setEditingProfile}
          profile={profile}
        />
      </ChunkProvider>
    </ProfileEditProvider>
  );
}

function ProfilePageContentBody({
  editingProfile,
  setEditingProfile,
  profile,
}: {
  editingProfile: boolean;
  setEditingProfile: (editing: boolean) => void;
  profile: Profile;
}) {
  const { loadingChunks } = useChunkContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="w-full max-w-screen-lg mx-auto min-h-full p-0 pb-8 md:p-4 md:pb-8">
      <div className="relative">
        <CoverImage userId={profile.id} avatarUrl={profile.avatar_url} />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 flex items-end justify-between">
            <div className="translate-y-1/2">
              <ProfilePicture
                avatar={profile.avatar_url}
                userId={profile.id}
                fullName={
                  profile.account_type === "organisation"
                    ? profile.first_name
                    : `${profile.first_name} ${profile.last_name || ""}`.trim()
                }
                editingProfile={editingProfile}
                isOrganisation={profile.account_type === "organisation"}
              />
            </div>
            <div className="translate-y-1/2">
              <ActionsButton
                profile={profile}
                setEditingProfile={setEditingProfile}
                editingProfile={editingProfile}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-24">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col gap-5">
            <UserDetails
              profile={profile}
              editingProfile={editingProfile}
              universitySuffix={
                <LinksSection
                  editingProfile={editingProfile}
                  profile={profile}
                />
              }
            />
          </div>
        </div>

        {loadingChunks ? (
          <div className="mb-4">
            <ChunkSkeleton />
          </div>
        ) : (
          <SummaryCard editingProfile={editingProfile} profile={profile} />
        )}

        {/* Chunks Section - ChunksDisplay replaces content with ChunksSkeleton when loading */}
        <ChunksSection editingProfile={editingProfile} />

        {editingProfile && (
          <div className="flex justify-center mt-12 mb-4">
            <Button
              variant="ghost"
              className="rounded-full px-4 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
            <DeleteAccountDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
}

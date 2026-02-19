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
    <ChunkProvider isEditing={editingProfile} visitingProfileId={profile.id}>
      <div
        className="h-[100dvh] w-full max-w-screen-lg mx-auto overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.3) transparent",
        }}
      >
        <div className="relative">
          <CoverImage editingProfile={editingProfile} />
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
              />
              <LinksSection
                editingProfile={editingProfile}
                profile={profile}
              />
            </div>
          </div>
          <SummaryCard editingProfile={editingProfile} profile={profile} />

          {/* Chunks Section */}
          <ChunksSection editingProfile={editingProfile} />
        </div>
      </div>
    </ChunkProvider>
  );
}

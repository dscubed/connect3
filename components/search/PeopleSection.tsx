"use client";
import { motion } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import { useUserProfiles } from "./hooks/useUserProfiles";

interface PeopleSectionProps {
  isVisible: boolean;
  searchMatches?: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    files: { file_id: string; description: string }[];
  }[];
  onUserClick: (user: {
    id: string;
    name: string;
    status?: string;
    location?: string;
    tldr?: string;
    avatar?: string;
  }) => void;
}

export default function PeopleSection({
  isVisible,
  searchMatches = [],
  onUserClick,
}: PeopleSectionProps) {
  // Extract user IDs from search matches
  const userIds = searchMatches.map((match) => match.user_id);

  // Fetch full user profiles using the hook
  const { profiles, loading } = useUserProfiles(userIds);

  if (!isVisible || searchMatches.length === 0) {
    return null;
  }

  // Transform profiles data for ProfileCard
  const enhancedProfiles = searchMatches.map((match) => {
    const profile = profiles.get(match.user_id);
    return {
      id: match.user_id,
      name: profile?.name || match.full_name,
      status: profile?.status,
      location: profile?.location,
      tldr: profile?.tldr,
      avatar: profile?.avatar || match.avatar_url || "/placeholder.svg",
    };
  });

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="mb-6">
        {/* <h3 className="text-white font-medium text-lg mb-2">
          People in Results
        </h3> */}
        <p className="text-white/60 text-sm">
          {searchMatches.length}{" "}
          {searchMatches.length === 1 ? "person" : "people"} found with relevant
          content
        </p>
      </div>

      {loading ? (
        <div className="text-white/60 text-center py-8">
          Loading profiles...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
          {enhancedProfiles.map((profile, index) => (
            <div key={profile.id} className="flex-shrink-0 w-80">
              <ProfileCard
                profile={profile}
                index={index}
                onClick={() => onUserClick(profile)}
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

"use client";
import { motion } from "framer-motion";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { useUserProfiles } from "./hooks/useUserProfiles";
import MatchResults from "./MatchResults";
import PeopleSection from "./PeopleSection";

interface SearchResults {
  result: string;
  matches: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    files: { file_id: string; description: string }[];
  }[];
  followUps: string;
}

interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: SearchResults | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface MessageThreadProps {
  message: ChatMessage;
  index: number;
  onUserClick?: (user: {
    id: string;
    name: string;
    status?: string;
    location?: string;
    tldr?: string;
    avatar?: string;
  }) => void;
}

export default function MessageThread({
  message,
  index,
  onUserClick,
}: MessageThreadProps) {
  // Extract user IDs from message content for profile fetching
  const userIds = message.content?.matches?.map((match) => match.user_id) || [];
  console.log("Message: ", message.query, "User IDs:", userIds);

  // Fetch full user profiles for the matched users
  const { profiles, loading: profilesLoading } = useUserProfiles(userIds);
  console.log("Message: ", message.query, "Fetched profiles:", profiles);

  return (
    <div className="space-y-8">
      {/* User Query */}
      <motion.div
        className="text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        <div className="inline-block">
          <div className="text-white/60 text-sm mb-1">you</div>
          <div className="text-white text-lg">{message.query}</div>
        </div>
      </motion.div>

      {/* AI Response */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <div className="text-white/60 text-sm mb-2">c3</div>

        {/* Loading State */}
        {message.status === "pending" || message.status === "processing" ? (
          <div className="space-y-4">
            <p className="text-white/80">
              {message.status === "processing"
                ? "processing your search..."
                : "queued for processing..."}
            </p>
            <div className="flex justify-center py-8">
              <CubeLoader size={48} />
            </div>
          </div>
        ) : message.status === "failed" ? (
          <div className="text-red-400">
            <p>Search failed. Please try again.</p>
          </div>
        ) : message.content ? (
          // Completed Results
          <CompletedResponse
            content={message.content}
            userProfiles={profiles}
            profilesLoading={profilesLoading}
            onUserClick={onUserClick}
          />
        ) : null}
      </motion.div>
    </div>
  );
}

function CompletedResponse({
  content,
  onUserClick,
}: {
  content: SearchResults;
  userProfiles: Map<
    string,
    {
      id: string;
      name: string;
      status?: string;
      location?: string;
      tldr?: string;
      avatar?: string;
    }
  >;
  profilesLoading: boolean;
  onUserClick?: (user: {
    id: string;
    name: string;
    status?: string;
    location?: string;
    tldr?: string;
    avatar?: string;
  }) => void;
}) {
  return (
    <motion.div
      className="space-y-6 text-white/80 leading-relaxed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Result */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {content.result}
      </motion.p>

      {/* User matches */}
      {(content.matches || []).map((match, userIndex) => {
        // const userProfile = userProfiles.get(match.user_id);
        return (
          <MatchResults
            key={`user-${userIndex}`}
            match={match}
            userIndex={userIndex}
          />
        );
      })}

      {/* Follow-up questions */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        {content.followUps}
      </motion.p>

      {/* People section */}
      <PeopleSection
        isVisible={content.matches && content.matches.length > 0}
        searchMatches={content.matches}
        onUserClick={onUserClick || (() => {})}
      />
    </motion.div>
  );
}

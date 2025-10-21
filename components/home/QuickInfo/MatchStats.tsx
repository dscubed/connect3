import MatchFilter from "./matches/MatchFilter";
import UserMatchSection from "./matches/UserMatchSection";
import { useUserMatches } from "../hooks/useUserMatches";
import { useState } from "react";
import { FilterType } from "./matches/types";

interface MatchStatsProps {
  userId: string | null;
  guest?: boolean;
}

export default function MatchStats({ userId, guest }: MatchStatsProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeSection, setActiveSection] = useState<
    "matchedYou" | "youMatched"
  >("matchedYou");

  // Use the hook!
  const { matchedYouUsers, youMatchedUsers, lastMatchDetails, loading } =
    useUserMatches(userId);
  console.log("MatchStats:", {
    matchedYouUsers,
    youMatchedUsers,
    lastMatchDetails,
    loading,
    userId,
  });

  if (!userId || guest) {
    return <span className="text-xs text-white/30">Not logged in</span>;
  }

  if (loading) {
    return <span className="text-xs text-white/30">Loading...</span>;
  }

  if (
    (!matchedYouUsers && !youMatchedUsers) ||
    (matchedYouUsers?.matchData.length === 0 &&
      youMatchedUsers?.matchData.length === 0)
  ) {
    return <span className="text-xs text-white/30">No matches yet</span>;
  }

  return (
    <div className="flex flex-col w-full px-2">
      <div className="flex flex-row items-end gap-4">
        <span className="text-lg font-bold text-white/90 mb-2">
          Match Stats
        </span>
        {/* Filter UI */}
        <MatchFilter filter={filter} setFilter={setFilter} />
      </div>

      <UserMatchSection
        matchedYouUsers={matchedYouUsers}
        youMatchedUsers={youMatchedUsers}
        filter={filter}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="h-0.5 bg-white/10 my-2 rounded-full w-full" />
      <div className="mt-2">
        <span className="font-semibold text-white/90">Last Match</span>
        <div className="flex flex-row justify-between items-center mt-1">
          <span className="text-white/60 italic truncate">
            {lastMatchDetails?.query ? `"${lastMatchDetails.query}"` : "N/A"}
          </span>
          <span className="text-xs text-white/40">
            {lastMatchDetails?.created_at ?? "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

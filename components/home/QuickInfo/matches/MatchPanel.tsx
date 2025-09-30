import { MessageCircle, User, Info } from "lucide-react";
import Image from "next/image";
import { MatchedUsersDetails, MatchData } from "./types";
import { FilterType } from "./types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchPanel({
  matchedUsersDetails,
  blurAvatars,
  type = "youMatched",
  filter = "all",
}: {
  matchedUsersDetails: MatchedUsersDetails | null;
  blurAvatars?: boolean;
  type?: "youMatched" | "matchedYou";
  filter?: FilterType;
}) {
  // Filtering logic
  function filterMatches(matches: MatchData[]) {
    if (filter === "all") return matches;
    const now = new Date();
    return matches.filter((m) => {
      const matchDate = new Date(m.created_at);
      if (filter === "month") {
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        return matchDate >= lastMonth;
      }
      if (filter === "week") {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return matchDate >= lastWeek;
      }
      if (filter === "day") {
        const lastDay = new Date(now);
        lastDay.setDate(now.getDate() - 1);
        return matchDate >= lastDay;
      }
      return true;
    });
  }

  function filterAvatars(
    filtered: MatchedUsersDetails,
    key: "user_id" | "queried_by"
  ) {
    const userIds = new Set(filtered.matchData.map((m) => m[key]));
    return filtered.avatarDetails.filter((a) => userIds.has(a.userId));
  }

  const filteredMatches = filterMatches(matchedUsersDetails?.matchData ?? []);
  const filteredAvatars = filterAvatars(
    {
      matchData: filteredMatches,
      avatarDetails: matchedUsersDetails?.avatarDetails ?? [],
    },
    type === "youMatched" ? "user_id" : "queried_by"
  );
  const hasMatches = filteredMatches.length > 0;
  const uniqueQueryCount = new Set(filteredMatches.map((m) => m.chatmessage_id))
    .size;

  // Tooltip logic for info icon
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipText =
    type === "youMatched"
      ? `You matched ${filteredAvatars.length} users in ${uniqueQueryCount} queries`
      : `You were matched by ${filteredAvatars.length} users in ${uniqueQueryCount} queries`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-2">
      {hasMatches && (
        <div className="flex items-center gap-2 relative">
          <span
            className="relative flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchStart={() => setShowTooltip(true)}
            onTouchEnd={() => setTimeout(() => setShowTooltip(false), 1200)}
            tabIndex={0}
          >
            <Info className="w-4 h-4 text-white/60 cursor-pointer" />
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 rounded bg-black/80 text-white text-xs shadow-lg whitespace-nowrap z-50"
                >
                  {tooltipText}
                </motion.div>
              )}
            </AnimatePresence>
          </span>
          <span className="font-semibold text-white/80 text-xs">
            {type === "youMatched" ? "You matched:" : "You were matched by:"}
          </span>
        </div>
      )}
      {hasMatches ? (
        <div className="flex flex-row items-center gap-3 min-h-[75px]">
          {/* Stats */}
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-4">
              <span className="flex items-center gap-1 font-normal text-white/60 text-lg">
                {uniqueQueryCount}
                <MessageCircle className="inline h-4 w-4 text-white/40" />
              </span>
              <span className="flex items-center gap-1 font-normal text-white/60 text-lg">
                {filteredAvatars.length}
                <User className="inline h-4 w-4 text-white/40" />
              </span>
            </div>
          </div>
          {/* Avatars */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex flex-row items-center gap-2 min-h-[40px]">
              {filteredAvatars.slice(0, 3).map((avatar, index) => (
                <div
                  key={avatar.userId}
                  className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20"
                  title={`User you matched #${index + 1}`}
                >
                  <Image
                    src={avatar.avatarUrl}
                    alt={`User you matched ${index + 1}`}
                    fill
                    className={`object-cover ${
                      blurAvatars ? "blur-[6px]" : ""
                    }`}
                    sizes="32px"
                  />
                </div>
              ))}
            </div>
            <span className="text-xs text-white/40 ml-1">
              {type === "youMatched"
                ? "Users you matched"
                : "Users who matched you"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 min-h-[75px] w-full justify-center text-center px-2 mt-2">
          {type == "youMatched" ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-xs text-white/30">No matches yet.</span>
              <span className="text-xs text-white/30">
                {" "}
                Start querying using the search bar above.
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-xs text-white/40">
                No one has matched you yet.
              </span>
              <button
                className="text-xs bg-white/10 hover:bg-white/20 text-white/80 px-2 py-1 rounded transition inline-block"
                onClick={() => (window.location.href = "/profile")}
              >
                Go to Profile
              </button>
              <span className="text-xs text-white/30 text-center">
                Adding profile chunks increases your chances of getting matched.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { formatTime } from "../hooks/QuickInfoUtils";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MatchData {
  user_id: string;
  chatroom_id: string;
  chatmessage_id: string;
  openai_file_id: string;
  queried_by: string;
  created_at: string;
}

interface LastMatchDetails {
  query: string;
  created_at: string;
}

export default function MatchStats({
  userId,
  activeTab,
}: {
  userId: string | null;
  activeTab: string;
}) {
  const supabase = useAuthStore((state) => state.getSupabaseClient)();
  const [loading, setLoading] = useState(true);
  const [matchesData, setMatchesData] = useState<MatchData[] | null>(null);
  const [lastMatchDetails, setLastMatchDetails] =
    useState<LastMatchDetails | null>(null);
  const [matchedAvatars, setMatchedAvatars] = useState<string[]>([]);

  useEffect(() => {
    async function getMatches(userId: string | null) {
      console.log("Fetching matches for user:", userId);
      setLoading(true);
      const { data, error } = await supabase.rpc("get_matches_for_user", {
        p_user_id: userId,
      });
      console.log("Fetched matches data:", data, "Error:", error);
      setLoading(false);

      console.log(data, error);
      setMatchesData(data as MatchData[] | null);
    }
    if (userId) {
      getMatches(userId);
    }
  }, [userId, supabase, activeTab]);

  useEffect(() => {
    async function getQueryFromMessage(chatmessage_id?: string | null) {
      if (!chatmessage_id) return "";
      const { data, error } = await supabase
        .from("chatmessages")
        .select("query")
        .eq("id", chatmessage_id)
        .single();
      if (error || !data) return "";
      return data.query || "";
    }

    async function getAvatars(userIds: string[]) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", userIds);
      if (error) {
        console.error("Error fetching avatars:", error);
        return [];
      }
      console.log("Fetched avatars:", data);
      return data;
    }

    if (matchesData && matchesData[0]) {
      const lastMatch = matchesData[0];
      getQueryFromMessage(lastMatch.chatmessage_id).then((query) => {
        setLastMatchDetails({
          query,
          created_at: formatTime(lastMatch.created_at),
        });
      });
    }
    if (matchesData && matchesData.length > 0) {
      const uniqueUserIds = Array.from(
        new Set(matchesData.map((match) => match.queried_by))
      );
      console.log("Unique matched user IDs:", uniqueUserIds);
      getAvatars(uniqueUserIds).then((profiles) => {
        // Create a lookup for avatar by user id
        const avatarMap = Object.fromEntries(
          profiles.map((profile) => [profile.id, profile.avatar_url])
        );
        // Map to the order of uniqueUserIds
        const avatars = uniqueUserIds
          .map((id) => avatarMap[id])
          .filter((url) => url) as string[];
        setMatchedAvatars(avatars.slice(0, 3)); // Limit to 3 avatars
      });
    }
  }, [matchesData, supabase]);

  if (!userId) {
    return <span className="text-xs text-white/30">Not logged in</span>;
  }

  if (loading) {
    return <span className="text-xs text-white/30">Loading...</span>;
  }

  if (matchesData?.length === 0) {
    return <span className="text-xs text-white/30">No matches yet</span>;
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-white/90 truncate">
          Total Matches:{" "}
          <span className="text-white/50 font-normal">
            {matchesData?.length ?? 0}
          </span>
        </span>
        <div className="flex items-center gap-2 mt-1">
          {matchedAvatars.map((avatarUrl, index) => (
            <div
              key={index}
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-black/20"
            >
              <Image
                src={avatarUrl}
                alt={`Matched user ${index + 1}`}
                fill
                className="object-cover blur-[6px]"
                sizes="24px"
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-white/40 ml-1">
          *Last 3 Matched Users
        </span>

        <div className="h-0.5 bg-white/5 my-1 rounded-full w-full mb-2" />

        <span className="font-semibold text-white/90 truncate">
          Last Match:
        </span>
        <div className="flex flex-row justify-between items-center">
          <span className="text-white/40 truncate">
            {lastMatchDetails?.query ? `"${lastMatchDetails.query}"` : "N/A"}
          </span>
          <span className="text-xs text-white/40 truncate">
            {lastMatchDetails?.created_at ?? "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

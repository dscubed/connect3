import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { formatTime } from "../hooks/QuickInfoUtils";
import {
  MatchedUsersDetails,
  AvatarDetails,
  MatchData,
  LastMatchDetails,
} from "../QuickInfo/matches/types";

export function useUserMatches(userId: string | null) {
  const supabase = useAuthStore((state) => state.getSupabaseClient)();
  const [loading, setLoading] = useState(true);
  const [matchedYouUsers, setMatchedYouUsers] =
    useState<MatchedUsersDetails | null>(null);
  const [youMatchedUsers, setYouMatchedUsers] =
    useState<MatchedUsersDetails | null>(null);
  const [lastMatchDetails, setLastMatchDetails] =
    useState<LastMatchDetails | null>(null);

  useEffect(() => {
    async function getMatchesAndAvatars(userId: string | null) {
      setLoading(true);
      const { data } = await supabase.rpc("get_matches_for_user", {
        p_user_id: userId,
      });
      const matchData = (data as MatchData[]) || [];

      const matchedYouIds = Array.from(
        new Set(matchData.map((match) => match.queried_by))
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", matchedYouIds);
      const avatarDetails = matchedYouIds
        .map((id) => {
          const profile = profiles?.find((p) => p.id === id);
          return profile ? { userId: id, avatarUrl: profile.avatar_url } : null;
        })
        .filter(Boolean) as AvatarDetails[];
      setMatchedYouUsers({ matchData, avatarDetails });

      // Get last match details
      if (matchData.length > 0) {
        const lastMatch = matchData[0];
        const { data: chatMsg, error } = await supabase
          .from("chatmessages")
          .select("query")
          .eq("id", lastMatch.chatmessage_id)
          .single();
        setLastMatchDetails({
          query: !error && chatMsg ? chatMsg.query : "",
          created_at: formatTime(lastMatch.created_at),
        });
      } else {
        setLastMatchDetails(null);
      }
      setLoading(false);
    }

    async function getYouMatchedAndAvatars(userId: string | null) {
      const { data } = await supabase.rpc("get_users_matches", {
        p_user_id: userId,
      });
      const matchData = (data as MatchData[]) || [];
      const youMatchedIds = Array.from(
        new Set(matchData.map((match) => match.user_id))
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", youMatchedIds);
      const avatarDetails = youMatchedIds
        .map((id) => {
          const profile = profiles?.find((p) => p.id === id);
          return profile ? { userId: id, avatarUrl: profile.avatar_url } : null;
        })
        .filter(Boolean) as AvatarDetails[];
      setYouMatchedUsers({ matchData, avatarDetails });
    }

    if (userId) {
      getMatchesAndAvatars(userId);
      getYouMatchedAndAvatars(userId);
    }
  }, [userId, supabase]);

  return { matchedYouUsers, youMatchedUsers, lastMatchDetails, loading };
}

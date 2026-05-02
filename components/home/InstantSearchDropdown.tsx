"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Instagram, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { createChatroom } from "@/lib/chatrooms/chatroomUtils";
import { toast } from "sonner";
import UserAvatar from "@/components/search/MatchResult/UserAvatar";
import type { InstantSearchResult } from "@/hooks/useInstantSearch";

interface InstantSearchDropdownProps {
  query: string;
  results: InstantSearchResult[];
  isLoading: boolean;
  onDismiss: () => void;
}

export function InstantSearchDropdown({
  query,
  results,
  isLoading,
  onDismiss,
}: InstantSearchDropdownProps) {
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const hasResults = results.length > 0;

  if (!isLoading && !hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 z-[200] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="px-4 py-5 text-center text-sm text-muted-foreground">
          No results for{" "}
          <span className="font-medium text-foreground">
            &quot;{query}&quot;
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-gray-50">
          <button
            onClick={() => {
              onDismiss();
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="flex-1 text-left text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            Search for{" "}
            <span className="font-medium text-foreground">
              &quot;{query}&quot;
            </span>{" "}
            →
          </button>
        </div>
      </div>
    );
  }

  const TICKETING_URL =
    process.env.NEXT_PUBLIC_TICKETING_URL ?? "https://tix.connect3.app";

  const handleResultClick = (result: InstantSearchResult) => {
    onDismiss();
    if (result.result_type === "event") {
      window.open(
        `${TICKETING_URL}/events/${result.id}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (
      result.result_type === "user" ||
      result.result_type === "organisation"
    ) {
      router.push(`/profile/${result.id}`);
    } else if (result.result_type === "instagram_post") {
      router.push(`/search?q=${encodeURIComponent(result.name)}`);
    }
  };

  const handleSearchAll = () => {
    onDismiss();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleDeepDive = async () => {
    if (!query.trim() || isStartingChat) return;
    setIsStartingChat(true);
    try {
      const { user, getSupabaseClient } = useAuthStore.getState();
      if (!user) {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          toast.error("Failed to create guest session.");
          return;
        }
      }
      const res = await createChatroom(query.trim());
      if (!res) return;
      onDismiss();
      router.push(`/chat/${res.chatroomId}`);
    } catch {
      toast.error("Failed to start chat.");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 z-[200] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
      {isLoading && !hasResults && (
        <div className="px-4 py-5 text-center text-sm text-muted-foreground">
          Searching…
        </div>
      )}

      {results.map((result) => {
        const onClick = () => handleResultClick(result);
        if (result.result_type === "event")
          return <EventRow key={result.id} result={result} onClick={onClick} />;
        if (result.result_type === "instagram_post")
          return (
            <InstagramPostRow
              key={result.id}
              result={result}
              onClick={onClick}
            />
          );
        return <ProfileRow key={result.id} result={result} onClick={onClick} />;
      })}

      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-gray-50 mt-1">
        <button
          onClick={handleSearchAll}
          className="flex-1 text-left text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
        >
          Search for{" "}
          <span className="font-medium text-foreground">
            &quot;{query}&quot;
          </span>{" "}
          →
        </button>
        <button
          onClick={handleDeepDive}
          disabled={isStartingChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          {isStartingChat ? "Starting…" : "Deep Dive with AI"}
        </button>
      </div>
    </div>
  );
}

/* ── Profile row ─────────────────────────────────────────────────────────── */

function ProfileRow({
  result,
  onClick,
}: {
  result: InstantSearchResult;
  onClick: () => void;
}) {
  const isOrg = result.result_type === "organisation";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
    >
      <UserAvatar
        avatarUrl={result.avatar_url ?? undefined}
        fullName={result.name}
        userId={result.id}
        isOrganisation={isOrg}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {result.name}
          </p>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
              isOrg
                ? "bg-violet-50 text-violet-600"
                : "bg-blue-50 text-blue-600",
            )}
          >
            {isOrg ? "Club" : "Person"}
          </span>
        </div>
        {result.snippet && (
          <p className="text-xs text-muted-foreground truncate">
            {result.snippet}
          </p>
        )}
      </div>
    </button>
  );
}

/* ── Event row ───────────────────────────────────────────────────────────── */

function EventRow({
  result,
  onClick,
}: {
  result: InstantSearchResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {result.avatar_url ? (
          <img
            src={result.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Calendar className="w-4 h-4 text-rose-400" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {result.name}
          </p>
          {result.sub_label && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {result.sub_label}
            </span>
          )}
        </div>
        {result.snippet && (
          <p className="text-xs text-muted-foreground truncate">
            {result.snippet}
          </p>
        )}
      </div>
    </button>
  );
}

/* ── Instagram post row ──────────────────────────────────────────────────── */

function InstagramPostRow({
  result,
  onClick,
}: {
  result: InstantSearchResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {result.avatar_url ? (
          <img
            src={result.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Instagram className="w-4 h-4 text-pink-400" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Instagram
            className="w-3 h-3 text-pink-400 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-foreground truncate">
            {result.name}
          </p>
          {result.sub_label && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {result.sub_label}
            </span>
          )}
        </div>
        {result.snippet && (
          <p className="text-xs text-muted-foreground truncate">
            {result.snippet}
          </p>
        )}
      </div>
    </button>
  );
}

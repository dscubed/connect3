"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Calendar, Instagram, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useInstantSearch } from "@/hooks/useInstantSearch";
import { useAuthStore } from "@/stores/authStore";
import { createChatroom } from "@/lib/chatrooms/chatroomUtils";
import { toast } from "sonner";
import UserAvatar from "@/components/search/MatchResult/UserAvatar";
import type { InstantSearchResult } from "@/hooks/useInstantSearch";

interface HeroSearchModalProps {
  onClose: () => void;
}

export function HeroSearchModal({ onClose }: HeroSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { results, isLoading } = useInstantSearch(query);

  const showResults = query.trim().length >= 2;
  const hasResults = results.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const TICKETING_URL =
    process.env.NEXT_PUBLIC_TICKETING_URL ?? "https://tix.connect3.app";

  const handleResultClick = (result: InstantSearchResult) => {
    onClose();
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
      onClose();
      router.push(`/chat/${res.chatroomId}`);
    } catch {
      toast.error("Failed to start chat.");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.97, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -6 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {/* Search input header */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
        >
          <Search className="w-5 h-5 text-violet-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, clubs, events…"
            className="flex-1 text-base outline-none placeholder:text-muted-foreground text-foreground bg-transparent"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Results list */}
        {showResults && (
          <div className="max-h-[50vh] overflow-y-auto">
            {isLoading && !hasResults && (
              <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                Searching…
              </div>
            )}
            {!isLoading && !hasResults && (
              <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                No results for{" "}
                <span className="font-medium text-foreground">
                  &quot;{query}&quot;
                </span>
              </div>
            )}
            {results.map((result) => {
              const onClick = () => handleResultClick(result);
              if (result.result_type === "event")
                return (
                  <ModalEventRow
                    key={result.id}
                    result={result}
                    onClick={onClick}
                  />
                );
              if (result.result_type === "instagram_post")
                return (
                  <ModalInstagramRow
                    key={result.id}
                    result={result}
                    onClick={onClick}
                  />
                );
              return (
                <ModalProfileRow
                  key={result.id}
                  result={result}
                  onClick={onClick}
                />
              );
            })}
          </div>
        )}

        {/* Footer */}
        {showResults && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-50">
            <button
              type="button"
              onClick={() => {
                onClose();
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
            <button
              type="button"
              onClick={handleDeepDive}
              disabled={isStartingChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              {isStartingChat ? "Starting…" : "Deep Dive with AI"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ModalProfileRow({
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
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
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

function ModalEventRow({
  result,
  onClick,
}: {
  result: InstantSearchResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
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

function ModalInstagramRow({
  result,
  onClick,
}: {
  result: InstantSearchResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
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

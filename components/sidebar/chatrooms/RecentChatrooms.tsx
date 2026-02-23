"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRecentChats } from "./useRecentChats";
import { Button } from "@/components/ui/button";
import { ChatroomLink } from "@/components/sidebar/ChatroomLink";
import { Check, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";

interface RecentChatroomsProps {
  guest?: boolean;
  chatroomId?: string;
}

export default function RecentChatrooms({
  guest,
  chatroomId,
}: RecentChatroomsProps) {
  const router = useRouter();

  const { user, profile } = useAuthStore();

  const { chatrooms, loading, renameChatroom, deleteChatroom } =
    useRecentChats();

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null,
  );
  const [busyId, setBusyId] = React.useState<string | null>(null);

  if (!user || !profile)
    return <span className="text-xs text-black/30 px-2">Not logged in</span>;
  if (loading)
    return <span className="text-xs text-black/30 px-2">Loading...</span>;
  if (chatrooms.length === 0)
    return <span className="text-xs text-black/30 px-2">No chatrooms</span>;

  async function onRenameSave(id: string) {
    setBusyId(id);
    try {
      const res = await renameChatroom(id, renameValue);
      if (res?.ok) setRenamingId(null);
    } finally {
      setBusyId(null);
    }
  }

  async function onDeleteConfirm(id: string) {
    setBusyId(id);
    try {
      await deleteChatroom(id);
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={`relative w-full ${guest && "min-h-[100px]"}`}>
      {/* Overlay for guest */}
      {guest && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg z-10 flex-col gap-4">
          <p className="text-sm text-white/80">
            Sign up to save your chatrooms!
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/auth/sign-up")}
          >
            Sign up
          </Button>
        </div>
      )}

      {/* Chatroom list */}
      <div
        className={`flex flex-col gap-1 w-full ${
          guest ? "opacity-60 pointer-events-none blur-sm" : ""
        }`}
      >
        {chatrooms.map((chat) => {
          const isRenaming = renamingId === chat.id;
          const isConfirmingDelete = confirmDeleteId === chat.id;
          const isBusy = busyId === chat.id;
          const href = `/search?chatroom=${chat.id}`;
          const isActive = chatroomId === chat.id;

          // --- Rename inline UI ---
          if (isRenaming) {
            return (
              <div key={chat.id} className="px-2 py-1">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm text-black outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRenameSave(chat.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  disabled={isBusy}
                  placeholder="Enter chatroom name..."
                />
                <div className="flex justify-end gap-1 mt-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 hover:bg-black/5"
                    onClick={() => setRenamingId(null)}
                    disabled={isBusy}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 hover:bg-violet-100 text-violet-600"
                    onClick={() => onRenameSave(chat.id)}
                    disabled={isBusy}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          }

          // --- Delete confirmation inline UI ---
          if (isConfirmingDelete) {
            return (
              <div
                key={chat.id}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-sm text-red-600 truncate flex-1">
                  Delete?
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 hover:bg-black/5"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={isBusy}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 hover:bg-red-100 text-red-600"
                  onClick={() => onDeleteConfirm(chat.id)}
                  disabled={isBusy}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          }

          // --- Normal chatroom link ---
          return (
            <div key={chat.id}>
              <ChatroomLink
                title={chat.title ?? "Untitled"}
                href={href}
                isActive={isActive}
                disabled={isBusy}
                onRename={() => {
                  setRenamingId(chat.id);
                  setRenameValue(chat.title ?? "");
                  setConfirmDeleteId(null);
                }}
                onDelete={() => {
                  setConfirmDeleteId(chat.id);
                  setRenamingId(null);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRecentChats } from "../home/hooks/useRecentChats";
import { Button } from "@/components/ui/button";

import { SidebarLink } from "@/components/sidebar/SidebarLink";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RecentChatroomsProps {
  userId: string | null;
  guest?: boolean;
  chatroomId?: string;
}

export default function RecentChatrooms({
  userId,
  guest,
  chatroomId,
}: RecentChatroomsProps) {
  const router = useRouter();

  const currentPathForHighlight = chatroomId
    ? `/search?chatroom=${chatroomId}`
    : "";

  const { chatrooms, loading, renameChatroom, deleteChatroom } =
    useRecentChats();

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState<string>("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  if (!userId)
    return <span className="text-xs text-black/30">Not logged in</span>;
  if (loading) return <span className="text-xs text-black/30">Loading...</span>;
  if (chatrooms.length === 0)
    return <span className="text-xs text-black/30">No chatrooms</span>;

  async function onRenameSave(id: string) {
    setBusyId(id);
    try {
      const res = await renameChatroom(id, renameValue);
      if (res?.ok) setRenamingId(null);
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Delete this chatroom? This cannot be undone.");
    if (!ok) return;

    setBusyId(id);
    try {
      await deleteChatroom(id);
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
        className={`flex flex-col gap-2 w-full ${
          guest ? "opacity-60 pointer-events-none blur-sm" : ""
        }`}
      >
        {chatrooms.map((chat) => {
          const isRenaming = renamingId === chat.id;
          const isBusy = busyId === chat.id;

          const href = `/search?chatroom=${chat.id}`;

          return (
            <div key={chat.id} className="flex items-start gap-1">
              <div className="flex-1 min-w-0">
                {!isRenaming ? (
                  <SidebarLink
                    label={chat.title}
                    href={href}
                    pathName={currentPathForHighlight}
                  />
                ) : (
                  <div className="flex flex-col items-end">
                    <div
                      className="flex items-center gap-2 rounded-lg bg-black/[0.03]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 rounded-md px-2 py-1 text-sm text-black outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onRenameSave(chat.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        disabled={isBusy}
                      />
                    </div>
                    <div className="flex flex-row gap-2 mt-2 animate-fade-in">
                      <Button
                        className="p-1 rounded hover:bg-black/5 disabled:opacity-50 h-fit"
                        onClick={() => onRenameSave(chat.id)}
                        disabled={isBusy}
                        aria-label="Save rename"
                        variant="ghost"
                      >
                        <Check className="w-4 h-4 text-black/70" />
                      </Button>
                      <Button
                        className="p-1 rounded hover:bg-black/5 disabled:opacity-50 h-fit"
                        onClick={() => setRenamingId(null)}
                        disabled={isBusy}
                        aria-label="Cancel rename"
                        variant="ghost"
                      >
                        <X className="w-4 h-4 text-black/70" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* DROPDOWN: stop propagation so it won't trigger navigation */}
              {!guest && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 rounded-md hover:bg-black/5 transition disabled:opacity-50"
                        disabled={isBusy}
                        aria-label="Chatroom options"
                      >
                        <MoreHorizontal className="w-4 h-4 text-black/50" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenamingId(chat.id);
                          setRenameValue(chat.title ?? "");
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => onDelete(chat.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

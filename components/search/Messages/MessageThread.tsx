"use client";
import { motion } from "framer-motion";
import { CompletedResponse } from "./CompletedResponse";
import { ChatMessage } from "../utils";
import { SearchProgressIndicator } from "./SearchProgressIndicator";
import UserAvatar from "../MatchResult/UserAvatar";
import { useAuthStore } from "@/stores/authStore";
import { Item } from "@/components/ui/item";
import { FilledLogo } from "@/components/logo/FilledLogo";
import { Button } from "@/components/ui/button";
import { Ban, Pencil, RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/TextArea";
import { EntityResult } from "@/lib/search/types";

interface MessageThreadProps {
  message: ChatMessage;
  index: number;
  onRetry: (messageId: string) => void;
  onEdit: (messageId: string, newQuery: string) => void;
  onProfileClick?: (entity: EntityResult) => void;
}

export function MessageThread({
  message,
  index,
  onRetry,
  onEdit,
  onProfileClick,
}: MessageThreadProps) {
  const { profile } = useAuthStore();

  const renderContent = () => {
    // Failed state
    if (message.status === "failed") {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-red-500 text-sm">
            Search failed. Please try again.
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(message.id)}
              className="w-fit"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      );
    }

    // Completed with content
    if (message.content) {
      return (
        <CompletedResponse
          content={message.content}
          onRetry={onRetry}
          id={message.id}
          onProfileClick={onProfileClick}
        />
      );
    }

    // Loading/processing state
    return (
      <SearchProgressIndicator progressEntries={message.progressEntries} />
    );
  };

  return (
    <div className="space-y-8">
      {/* User Query */}
      <motion.div
        className="flex justify-end gap-4 w-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        <QueryDisplay
          query={message.query}
          onEdit={(newQuery) => onEdit(message.id, newQuery)}
          onRetry={() => onRetry(message.id)}
        />

        <UserAvatar
          avatarUrl={profile?.avatar_url || ""}
          fullName={profile?.first_name || "User"}
          userId={profile?.id || ""}
          isOrganisation={profile?.account_type === "organisation"}
        />
      </motion.div>

      {/* AI Response */}
      <motion.div
        className="flex flex-row gap-4 space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <FilledLogo width={32} height={32} className="flex-shrink-0" />

        {renderContent()}
      </motion.div>
    </div>
  );
}

export function QueryDisplay({
  query,
  onEdit,
  onRetry,
}: {
  query: string;
  onEdit: (newQuery: string) => void;
  onRetry: () => void;
}) {
  const [editedQuery, setEditedQuery] = useState(query);
  const [editingQuery, setEditingQuery] = useState(false);

  return (
    <div className="flex flex-col w-full sm:max-w-[50%] px-2 items-end">
      <Item
        className="text-base bg-background rounded-xl border-muted p-3 w-fit"
        variant={"outline"}
      >
        {editingQuery ? (
          <Textarea
            value={editedQuery}
            onChange={(e) => setEditedQuery(e.target.value)}
            className="w-fit resize-none !p-0 !border-none focus-visible:ring-0 !text-base bg-transparent min-h-0"
            onKeyDown={(e) => {
              if (e.key == "Enter" && !e.shiftKey) {
                onEdit(editedQuery);
                setEditingQuery(false);
                e.preventDefault();
              }
              if (e.key == "Escape") {
                setEditingQuery(false);
                setEditedQuery(query);
                e.preventDefault();
              }
            }}
          />
        ) : (
          <span>{query}</span>
        )}
      </Item>
      <div className="flex justify-end space-x-2 mt-1">
        {editingQuery ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="bg-transparent hover:bg-muted/10 hover:text-muted !p-1 h-fit"
              onClick={() => {
                setEditingQuery(false);
                setEditedQuery(query);
              }}
            >
              <Ban className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingQuery(false);
                onEdit(editedQuery);
              }}
              className="bg-transparent hover:bg-muted/10 hover:text-muted !p-1 h-fit"
            >
              <Send className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="bg-transparent hover:bg-muted/10 hover:text-muted !p-1 h-fit"
              onClick={() => setEditingQuery(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-transparent hover:bg-muted/10 hover:text-muted !p-1 h-fit"
              onClick={() => onRetry()}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

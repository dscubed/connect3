"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { InstagramPost } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

function PostCard({ post, isNew }: { post: InstagramPost; isNew: boolean }) {
  return (
    <div className="flex gap-4 px-6 py-4">
      {post.images.length > 0 && (
        <div className={cn("flex shrink-0 gap-1.5", !isNew && "opacity-70")}>
          {post.images.slice(0, 2).map((imgUrl, i) => (
            <div
              key={i}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
              <Image
                src={imgUrl}
                alt={`image ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              {i === 1 && post.images.length > 2 && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-sm font-semibold text-white">
                  +{post.images.length - 2}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        {post.posted_by && (
          <p className="text-xs font-medium text-gray-500">@{post.posted_by}</p>
        )}
        <p className="line-clamp-3 text-sm text-gray-800">
          {post.caption || (
            <span className="italic text-gray-300">No caption</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          {post.timestamp && (
            <span>
              {new Date(post.timestamp * 1000).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {post.location && <span className="truncate">{post.location}</span>}
          {post.collaborators.length > 0 && (
            <span>
              with {post.collaborators.map((c) => `@${c}`).join(", ")}
            </span>
          )}
          <span className="font-mono opacity-50">{post.id}</span>
        </div>
      </div>
    </div>
  );
}

interface PostsDialogProps {
  viewingSlug: string | null;
  viewingPosts: InstagramPost[];
  viewingResultIds: Set<string>;
  viewingLoading: boolean;
  onClose: () => void;
}

export default function PostsDialog({
  viewingSlug,
  viewingPosts,
  viewingResultIds,
  viewingLoading,
  onClose,
}: PostsDialogProps) {
  const newPosts = viewingPosts.filter((p) => viewingResultIds.has(p.id));
  const oldPosts = viewingPosts.filter((p) => !viewingResultIds.has(p.id));

  return (
    <Dialog
      open={!!viewingSlug}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-sm font-semibold">
            Posts for <span className="font-mono">{viewingSlug}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            {viewingLoading
              ? "Loading\u2026"
              : `${viewingPosts.length} post${viewingPosts.length !== 1 ? "s" : ""} linked`}
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {viewingLoading ? (
            <div className="flex h-32 items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading posts&hellip;
            </div>
          ) : viewingPosts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">
              No posts linked to this slug yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {newPosts.length > 0 && (
                <>
                  <div className="bg-emerald-50 px-6 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                      New — {newPosts.length} post
                      {newPosts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {newPosts.map((post) => (
                    <PostCard key={post.id} post={post} isNew={true} />
                  ))}
                </>
              )}
              {oldPosts.length > 0 && (
                <>
                  <div className="bg-gray-50 px-6 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Previous — {oldPosts.length} post
                      {oldPosts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {oldPosts.map((post) => (
                    <PostCard key={post.id} post={post} isNew={false} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

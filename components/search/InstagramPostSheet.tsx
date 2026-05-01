"use client";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface InstagramPostSheetProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramPostSheet({
  postId,
  isOpen,
  onClose,
}: InstagramPostSheetProps) {
  if (!postId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        side="right"
        className="w-full !max-w-2xl p-0 overflow-hidden bg-white flex flex-col"
      >
        <SheetTitle className="sr-only">Instagram Post</SheetTitle>
        <div className="flex-1 overflow-y-auto flex justify-center py-6 px-4">
          {/* key forces a fresh blockquote each time postId changes */}
          <InstagramEmbed key={postId} postId={postId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InstagramEmbed({ postId }: { postId: string }) {
  useEffect(() => {
    const win = window as Window & {
      instgrm?: { Embeds: { process: () => void } };
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.instagram.com/embed.js"]',
    );

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already loaded — just re-process the new blockquote
      win.instgrm?.Embeds.process();
    }
  }, [postId]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-captioned
      data-instgrm-permalink={`https://www.instagram.com/p/${postId}/`}
      data-instgrm-version="14"
      style={{
        background: "#FFF",
        border: 0,
        borderRadius: "3px",
        boxShadow:
          "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
        maxWidth: "540px",
        minWidth: "326px",
        padding: 0,
        width: "100%",
      }}
    >
      <a href={`https://www.instagram.com/p/${postId}/`}>
        View this post on Instagram
      </a>
    </blockquote>
  );
}

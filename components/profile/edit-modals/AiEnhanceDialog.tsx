"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { Textarea } from "@/components/ui/TextArea";
import { cn } from "@/lib/utils";

const EXAMPLE_QUESTIONS = [
  "Can you make this more concise but still natural?",
  "Can you highlight my key projects more clearly?",
  "Can you keep my tone but make this flow better?",
  "Can you make this sound more confident without exaggerating?",
  "Can you emphasise my technical skills more?",
  "Can you improve clarity while keeping the same voice?",
  "Can you make this feel more engaging for networking?",
  "Can you tighten this while keeping all the important details?",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AiEnhanceDialogProps {
  initialText: string;
  fieldType: "external_tldr" | "chunk";
  triggerLabel?: string;
  title?: string;
  onApply: (newText: string) => void;
}

const CARD =
  "bg-background text-foreground rounded-2xl border border-foreground/20 backdrop-blur shadow-xl";

const INPUT =
  "bg-transparent text-sm transition-all placeholder:text-foreground/50 " +
  "scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent focus:scrollbar-thumb-white/50 " +
  "outline-none resize-none focus-visible:ring-0 border-none min-h-0";

export function AiEnhanceDialog({
  initialText,
  fieldType,
  triggerLabel = "Enhance",
  title,
  onApply,
}: AiEnhanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftText, setDraftText] = useState(initialText);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [example, setExample] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const { makeAuthenticatedRequest, user } = useAuthStore();

  useEffect(() => {
    if (!open) {
      setDraftText(initialText);
      setMessages([]);
      setInput("");
    }
  }, [initialText, open]);

  useEffect(() => {
    if (!open) return;
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      const random =
        EXAMPLE_QUESTIONS[Math.floor(Math.random() * EXAMPLE_QUESTIONS.length)];
      setExample(random);

      if (messages.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              fieldType === "chunk"
                ? "Tell me what you want this highlight to emphasise, and I’ll help you refine it."
                : "Tell me what you want this TLDR to highlight, and I’ll help you refine it.",
          },
        ]);
      }
    } else {
      setMessages([]);
      setInput("");
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (!user) {
      toast.error("You need to be signed in to use AI enhancement.");
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await makeAuthenticatedRequest(`/api/profiles/enhance-field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldType,
          text: draftText,
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enhance text");

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply as string,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setDraftText((data.improvedText as string) || draftText);
    } catch (err) {
      console.error("enhance-field client error", err);
      toast.error("Failed to enhance. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Something went wrong while enhancing your text. You can try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply(draftText);
    setOpen(false);
  };

  const dialogTitle =
    title ||
    (fieldType === "chunk" ? "Enhance this highlight" : "Enhance your TLDR");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* Match pill-ish soft purple vibe */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="gap-1 rounded-2xl bg-background/60 hover:bg-background/80 border border-foreground/20 text-foreground/80"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs">{triggerLabel}</span>
        </Button>
      </DialogTrigger>

      {/* DialogContent styled like your SearchBar card */}
      <DialogContent
        className={cn(
          "w-[min(100vw-2rem,760px)] max-h-[85vh] overflow-hidden p-6",
          CARD
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 h-[70vh]">
          {/* CHATROOM SECTION */}
          <div className={cn("flex flex-col flex-1 min-h-0 p-4", CARD, "shadow-none")}>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-3 pr-1"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl px-4 py-3",
                    "border border-foreground/15",
                    m.role === "assistant"
                      ? "bg-background/60"
                      : "bg-background/80"
                  )}
                >
                  <div className="font-medium mb-1 text-xs text-foreground/60">
                    {m.role === "assistant" ? "AI" : "You"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {m.content}
                  </p>
                </div>
              ))}

              {messages.length === 0 && (
                <p className="text-sm text-foreground/60">
                  Start a conversation to get suggestions on how to improve your summary.
                </p>
              )}
            </div>

            {/* Input row styled like your SearchBar */}
            <form
              className={cn("mt-3 flex items-end gap-3 px-4 py-3", CARD, "shadow-none")}
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <Textarea
                className={cn(INPUT, "w-full max-h-24")}
                placeholder={example ? `Ask (e.g. “${example}”)` : "Ask the AI for help..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-2xl"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send
              </Button>
            </form>
          </div>

          {/* EDITABLE DRAFT SECTION */}
          <div className="flex flex-col flex-[0.8] min-h-0">
            <div className="mb-2 text-sm font-medium text-foreground">
              Current draft{" "}
              <span className="ml-1 text-xs text-foreground/60">
                (you can edit this while chatting)
              </span>
            </div>

            <div className={cn("px-4 py-3", CARD, "shadow-none")}>
              <Textarea
                className={cn(INPUT, "w-full min-h-[120px] max-h-[240px]")}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-foreground/20"
                onClick={() => setDraftText(initialText)}
              >
                Reset to original
              </Button>

              <Button type="button" className="rounded-2xl" onClick={handleApply}>
                Apply changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

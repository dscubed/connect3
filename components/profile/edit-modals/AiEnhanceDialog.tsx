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
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { Textarea } from "@/components/ui/TextArea";
import { cn } from "@/lib/utils";

const EXAMPLE_QUESTIONS_CHUNK = [
  "Can you make this more concise but still natural?",
  "Can you highlight my key responsibilities more clearly?",
  "Can you keep my tone but make this flow better?",
  "Can you make this sound more confident without exaggerating?",
  "Can you emphasise my technical skills more?",
  "Can you improve clarity while keeping the same voice?",
  "Can you tighten this while keeping all the important details?",
];

const EXAMPLE_QUESTIONS_SUMMARY = [
  // edit-style
  "Can you make this more concise but still natural?",
  "Can you keep my tone but make this flow better?",
  "Can you make this feel more engaging for networking?",

  // generate-style
  "Can you write something engaging for me based on my profile?",
  "Can you generate a summary that highlights my key projects?",
  "Can you write a confident networking summary from my chunks?",
];

const EXAMPLE_QUESTIONS_EVENT = [
  "Can you make this more inviting for students?",
  "Can you highlight who should attend and why?",
  "Can you make the call-to-action stronger?",
  "Can you tighten this while keeping key details?",
  "Can you make this sound more energetic but still clear?",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AiEnhanceDialogProps {
  initialText: string;
  fieldType: "external_tldr" | "chunk" | "event_description";
  title?: string;
  onApply: (newText: string) => void;
  assistantIntro?: string;
}

const INPUT =
  "bg-transparent text-sm transition-all placeholder:text-secondary-foreground/50 " +
  "scrollbar-hide outline-none resize-none focus-visible:ring-0 border-none min-h-0";

export function AiEnhanceDialog({
  initialText,
  fieldType,
  title,
  onApply,
  assistantIntro,
}: AiEnhanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftText, setDraftText] = useState(initialText);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [example, setExample] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const { makeAuthenticatedRequest, user } = useAuthStore();

  // 1) Reset everything when dialog closes
  useEffect(() => {
    if (!open) {
      setDraftText(initialText);
      setMessages([]);
      setInput("");
    }
  }, [initialText, open]);

  // 2) KEEP draftText in sync while dialog is OPEN
  useEffect(() => {
    if (open) setDraftText(initialText);
  }, [initialText, open]);

  // 3) Auto-scroll chat
  useEffect(() => {
    if (!open) return;
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      const examples =
        fieldType === "chunk"
          ? EXAMPLE_QUESTIONS_CHUNK
          : fieldType === "event_description"
          ? EXAMPLE_QUESTIONS_EVENT
          : EXAMPLE_QUESTIONS_SUMMARY;
      const random = examples[Math.floor(Math.random() * examples.length)];
      setExample(random);

      if (messages.length === 0) {
        const defaultIntro =
          fieldType === "chunk"
            ? "Tell me what you want this highlight to emphasise, and I'll refine it."
            : fieldType === "event_description"
            ? "Tell me what you want this event description to emphasise, and I'll refine it."
            : "Tell me what you want this summary to highlight — or ask me to write one for you.";
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: assistantIntro ?? defaultIntro,
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
      const res = await makeAuthenticatedRequest(
        `/api/profiles/enhance-field`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fieldType,
            text: draftText,
            messages: updatedMessages.map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        }
      );

      if (res.status === 413) {
        toast.error(
          "Your message is too long. Please shorten your text or conversation.",
        );
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enhance text");

      const reply =
        typeof data.reply === "string" && data.reply.trim().length > 0
          ? data.reply.trim()
          : "Done — I updated the draft below.";

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
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

  const handleApply = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    onApply(draftText);
    setOpen(false);
  };

  const dialogTitle =
    title ||
    (fieldType === "chunk"
      ? "Enhance this highlight"
      : fieldType === "event_description"
      ? "Enhance event description"
      : "Enhance your summary");

  const emptyStateText =
    fieldType === "chunk"
      ? "Start a conversation to get suggestions on how to improve this highlight."
      : fieldType === "event_description"
      ? "Start a conversation to get suggestions on how to improve this event description."
      : "Start a conversation to get suggestions on how to improve your summary.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="!bg-transparent !text-muted rounded-full border border-muted/50 !p-1.5 h-fit"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      {/* DialogContent styled like your SearchBar "bg-secondary text-secondary-foreground rounded-2xl border border-foreground/20 backdrop-blur shadow-xl" */}
      <DialogContent
        className={cn(
          "w-[min(100vw-2rem,760px)] max-h-[85vh] overflow-hidden p-2 border-none",
          "bg-secondary text-secondary-foreground rounded-2xl backdrop-blur shadow-xl"
        )}
      >
        <DialogHeader className="pr-4 pl-2 pt-2">
          <DialogTitle className="font-medium">{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 h-[70vh]">
          {/* CHATROOM SECTION */}
          <div className="flex flex-col flex-1 min-h-0 p-2 pt-0 text-secondary-foreground rounded-2xl border border-border">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-2 pt-2"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-xl px-2.5 py-2",
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
                <p className="text-sm text-secondary-foreground/60">
                  {emptyStateText}
                </p>
              )}
            </div>

            {/* Input row styled like your SearchBar */}
            <form
              className={cn(
                "mt-3 flex gap-3 px-2.5 py-2",
                "bg-secondary text-secondary-foreground rounded-2xl border border-foreground/20 backdrop-blur shadow-xl",
                "shadow-none"
              )}
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sendMessage();
              }}
            >
              <Textarea
                className={cn(INPUT, "flex-1 max-h-24 p-0 pl-1 py-1 my-auto")}
                placeholder={
                  example ? `Ask (e.g. “${example}”)` : "Ask the AI for help..."
                }
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
                className="rounded-full shadow-none bg-purple-600 hover:bg-purple-700 w-8 h-8 text-white mt-auto"
              >
                {isLoading 
                  ? <Loader2 className="size-6 animate-spin" /> 
                  : <ArrowRight className="!size-5" />}
              </Button>
            </form>
          </div>

          {/* EDITABLE DRAFT SECTION */}
          <div className="flex flex-col gap-2 flex-[0.8] min-h-0 overflow-hidden">
            <div className="ml-2 text-sm font-medium">
              Current draft{" "}
              <span className="ml-1 text-xs text-muted">
                (you can edit this while chatting)
              </span>
            </div>

            <div
              className="flex-1 min-h-0 rounded-2xl border border-border"
            >
              <Textarea
                className={cn(
                  INPUT,
                  "w-full h-full min-h-[120px] max-h-full overflow-y-auto scrollbar-hide px-3.5 py-3"
                )}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="p-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "rounded-full bg-gray-200 px-4 py-1.5 text-muted hover:bg-gray-300 hover:text-card-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDraftText(initialText);
                }}
              >
                Reset to original
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "rounded-full bg-purple-500 px-4 py-1.5 text-white hover:bg-purple-600 hover:text-white"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApply(e);
                }}
              >
                Apply changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

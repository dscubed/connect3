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
  // only user-facing fields
  fieldType: "external_tldr" | "chunk";
  triggerLabel?: string;
  title?: string;
  onApply: (newText: string) => void;
}

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

  // Reset when closing; keep in sync with latest initialText
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
    if (el) {
      // Scroll to bottom whenever messages change
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);  

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  
    if (nextOpen) {
      // choose a random example prompt
      const random = EXAMPLE_QUESTIONS[Math.floor(Math.random() * EXAMPLE_QUESTIONS.length)];
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
      // reset modal state
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
          fieldType, // "external_tldr" or "chunk"
          text: draftText,
          messages: updatedMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enhance text");
      }

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
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Something went wrong while enhancing your text. You can try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply(draftText); // parent decides when/how to persist
    setOpen(false);
  };

  const dialogTitle =
    title ||
    (fieldType === "chunk"
      ? "Enhance this highlight"
      : "Enhance your TLDR");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="p-2 rounded border border-white/20 bg-black/10 hover:bg-black/20 transition flex items-center gap-1"
        >
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-xs text-white/70">{triggerLabel}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[min(100vw-2rem,700px)] max-h-[85vh] overflow-hidden bg-[#18181b] border border-white/20 text-white">
        <DialogHeader>
            <DialogTitle className="text-white">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 h-[70vh]">
            {/* CHATROOM SECTION */}
            <div className="flex flex-col flex-1 min-h-0 border border-white/20 rounded-md p-3">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {messages.map((m) => (
                    <div
                        key={m.id}
                        className={
                        m.role === "assistant"
                            ? "text-sm rounded-md bg-white/5 px-3 py-2"
                            : "text-sm rounded-md bg-white/10 px-3 py-2"
                        }
                    >
                        <div className="font-medium mb-1 text-xs text-white/60">
                        {m.role === "assistant" ? "AI" : "You"}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-white/90">
                        {m.content}
                        </p>
                    </div>
                    ))}

                    {messages.length === 0 && (
                    <p className="text-sm text-white/50">
                        Start a conversation to get suggestions on how to improve your summary.
                    </p>
                    )}
                </div>
                <form
                    className="flex gap-2 mt-3"
                    onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                    }}
                >
                    <textarea
                    rows={2}
                    placeholder={example ? `e.g. “${example}”` : "Ask the AI for help..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                    }}
                    className="flex-1 bg-black/30 text-white border border-white/20 rounded-md px-2 py-1 text-sm"
                    />
                    <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4"
                    >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send
                    </Button>
                </form>
                </div>
                {/* EDITABLE DRAFT SECTION */}
                <div className="flex flex-col flex-[0.8] min-h-0">
                    <div className="mb-2 text-sm font-medium text-white/80">
                        Current draft{" "}
                        <span className="ml-1 text-xs text-white/40">
                        (you can edit this while chatting)
                        </span>
                    </div>
                    <textarea
                        className="flex-1 bg-black/20 text-white border border-white/20 rounded-md px-2 py-2 text-sm overflow-y-auto"
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                        <Button
                        type="button"
                        variant="outline"
                        className="border-white/30 text-white/80"
                        onClick={() => setDraftText(initialText)}
                        >
                        Reset to original
                        </Button>
                        <Button
                        type="button"
                        className="bg-white text-black hover:bg-white/90"
                        onClick={handleApply}
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

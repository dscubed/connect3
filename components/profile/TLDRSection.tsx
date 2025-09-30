"use client";
import { Zap, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

interface TLDRSectionProps {
  tldr: string | null;
}

export default function TLDRSection({ tldr }: TLDRSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const { makeAuthenticatedRequest, user, updateProfile } = useAuthStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-expand textarea height as user types
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
    setUserPrompt(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [userPrompt, showPromptInput]);

  const handleGenerateTLDR = async () => {
    setShowPromptInput(false); // Hide input immediately when generating
    setIsLoading(true);
    try {
      const res = await makeAuthenticatedRequest(
        `/api/profiles/generate-tldr`,
        {
          method: "POST",
          body: JSON.stringify({ userId: user?.id, userPrompt }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate TLDR");
      }
      toast.success("TLDR generated!");
      updateProfile({ tldr: data.tldr });
    } catch {
      toast.error("Failed to generate TLDR. Please try again.");
    }
    setIsLoading(false);
    setUserPrompt("");
  };

  const handleCancel = () => {
    setShowPromptInput(false);
    setUserPrompt("");
  };

  return (
    <div className="mb-12">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">tldr</h2>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowPromptInput(true)}
              className="p-2 rounded border border-white/20 bg-black/10 hover:bg-black/20 transition flex items-center gap-1"
              disabled={isLoading}
              title="Generate TLDR from your chunks"
            >
              <Zap className="h-4 w-4 text-white" />
              <span className="text-xs text-white/70">Generate</span>
            </button>
            {/* Floating dropdown input just below the button */}
            {showPromptInput && (
              <div
                className="absolute left-0 mt-2 min-w-[380px] bg-[#18181b] border border-white/20 rounded-lg shadow-lg p-3 flex flex-col gap-2 z-50"
                style={{
                  top: buttonRef.current
                    ? buttonRef.current.offsetHeight + 8
                    : "100%",
                  left: buttonRef.current
                    ? buttonRef.current.offsetLeft - 280
                    : 280,
                }}
              >
                <textarea
                  ref={textareaRef}
                  className="bg-black/30 text-white border border-white/20 rounded p-2 outline-none resize-none block w-full"
                  value={userPrompt}
                  onChange={handlePromptChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleGenerateTLDR();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      handleCancel();
                    }
                  }}
                  placeholder="Optional: Add instructions for TLDR generation..."
                  autoFocus
                  rows={1}
                  style={{ overflow: "hidden" }}
                  disabled={isLoading}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-3 py-1 rounded bg-neutral-800 text-white text-xs"
                    onClick={handleCancel}
                    disabled={isLoading}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-white text-black text-xs flex items-center justify-center"
                    onClick={handleGenerateTLDR}
                    disabled={isLoading}
                    type="button"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                    ) : (
                      "Generate"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-white/70 leading-relaxed text-lg">
          {isLoading ? (
            <span className="text-white/40 italic">Generating TLDR...</span>
          ) : (
            tldr || (
              <span className="text-white/40 italic">
                Click the lightning icon to generate your TLDR!
              </span>
            )
          )}
        </p>
      </div>
    </div>
  );
}

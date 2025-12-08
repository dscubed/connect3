"use client";
import { Zap, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

interface TLDRSectionProps {
  tldr: string | null;
}

export default function TLDRSection({ tldr }: TLDRSectionProps) {
  const [localTldr, setLocalTldr] = useState(tldr ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [showPromptInput, setShowPromptInput] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const { makeAuthenticatedRequest, user, updateProfile } = useAuthStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

   // Keep in sync with server value when NOT editing
   useEffect(() => {
    if (!isEditing) {
      setLocalTldr(tldr ?? "");
    }
  }, [tldr, isEditing]);

  // auto-resize prompt textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [userPrompt, showPromptInput]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
  };

  const handleCancelPrompt = () => {
    setShowPromptInput(false);
    setUserPrompt("");
  };

  const handleEditOrSave = async () => {
    if (!user) return;

    // If not currently editing → enter edit mode
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // If editing → Save
    setIsSaving(true);
    try {
      await updateProfile({ tldr: localTldr });
      toast.success("TLDR saved.");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save TLDR.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnhanceTLDR = async () => {
    if (!user) return;

    setShowPromptInput(false);
    setIsEnhancing(true);
    try {
      const res = await makeAuthenticatedRequest(
        `/api/profiles/generate-tldr`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userPrompt,
            currentTldr: localTldr, // use whatever is currently written
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enhance TLDR");
      }

      const newTldr = (data.tldr as string) ?? "";
      setLocalTldr(newTldr);
      updateProfile({ tldr: newTldr });
      toast.success("TLDR enhanced!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to enhance TLDR. Please try again.");
    } finally {
      setIsEnhancing(false);
      setUserPrompt("");
    }
  };

  return (
    <div className="mb-12">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">tldr</h2>

          <div className="flex items-center gap-2">
            {/* Edit / Save toggle button */}
            <button
              onClick={handleEditOrSave}
              disabled={isSaving}
              className="px-3 py-1 rounded border border-white/20 bg-black/10 hover:bg-black/20 text-xs text-white/80 flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save" : "Edit"}</span>
              )}
            </button>

            {/* Enhance button + prompt popover */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowPromptInput(true)}
                className="p-2 rounded border border-white/20 bg-black/10 hover:bg-black/20 transition flex items-center gap-1"
                disabled={isEnhancing}
                title="Enhance TLDR from your chunks"
              >
                <Zap className="h-4 w-4 text-white" />
                <span className="text-xs text-white/70">
                  {isEnhancing ? "Enhancing..." : "Enhance"}
                </span>
              </button>

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
                        handleEnhanceTLDR();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelPrompt();
                      }
                    }}
                    placeholder="Optional: Add instructions for enhancement..."
                    autoFocus
                    rows={1}
                    style={{ overflow: "hidden" }}
                    disabled={isEnhancing}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-3 py-1 rounded bg-neutral-800 text-white text-xs"
                      onClick={handleCancelPrompt}
                      disabled={isEnhancing}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-white text-black text-xs flex items-center justify-center"
                      onClick={handleEnhanceTLDR}
                      disabled={isEnhancing}
                      type="button"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                      ) : (
                        "Enhance"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display mode vs edit mode */}
        {isEditing ? (
          <textarea
            className="w-full bg-black/20 border border-white/20 rounded-md p-3 text-white/90 text-base leading-relaxed min-h-[96px] outline-none focus:border-white/40 resize-vertical"
            value={localTldr}
            onChange={(e) => setLocalTldr(e.target.value)}
            placeholder="Write a short summary of yourself (e.g. degree, interests, key projects)."
          />
        ) : (
          <p className="text-white/70 leading-relaxed text-lg">
            {localTldr ? (
              localTldr
            ) : (
              <span className="text-white/40 italic">
                Click “Edit” to write a short summary of yourself, or use
                “Enhance” to generate one from your chunks.
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/TextArea";
import { toast } from "sonner";
import { FormShell } from "@/components/FormShell";
import { ContactIllustration } from "@/components/illustration/ContactIllustration";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.description.length < 20) {
      toast.error("Error description must be at least 20 characters");
      return;
    }

    if (screenshot && screenshot.size > 10 * 1024 * 1024) {
      toast.error("Screenshot must be less than 10MB");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending your message...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("description", formData.description);
      if (screenshot) {
        formDataToSend.append("screenshot", screenshot);
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      toast.success("Message sent successfully! We'll get back to you soon.", {
        id: loadingToast,
      });

      // Reset form
      setFormData({ name: "", email: "", description: "" });
      setScreenshot(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormShell
      title="Contact Support"
      subtitle="Having issues? Let us know and we'll help you out."
      backLink={{ href: "/", label: "Back to Home" }}
      illustration={<ContactIllustration />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-1">
          <Label htmlFor="name" className="text-sm font-medium text-black">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="h-12 rounded-2xl border-2 border-muted/20 px-4 text-sm placeholder:text-muted focus-visible:ring-foreground"
            placeholder="Your name"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="email" className="text-sm font-medium text-black">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="h-12 rounded-2xl border-2 border-muted/20 px-4 text-sm placeholder:text-muted focus-visible:ring-foreground"
            placeholder="your.email@example.com"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="description" className="text-sm font-medium text-black">
            Error Description
          </Label>
          <p className="text-xs text-muted mb-1">
            Minimum 20 characters
          </p>
          <Textarea
            id="description"
            required
            minLength={20}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-2xl border-2 border-muted/20 px-4 py-3 text-sm placeholder:text-muted focus-visible:ring-foreground min-h-[120px]"
            placeholder="Describe the issue you're experiencing..."
          />
          <p className="text-xs text-muted mt-1">
            {formData.description.length}/20 characters
          </p>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="screenshot" className="text-sm font-medium text-black">
            Screenshot (Optional)
          </Label>
          <p className="text-xs text-muted mb-1">Maximum 10MB</p>
          
          {!screenshot ? (
            <label
              htmlFor="screenshot"
              className={cn(
                "h-12 rounded-2xl border-2 border-muted/20 bg-white",
                "flex items-center justify-center gap-2 cursor-pointer",
                "hover:bg-muted/5 transition-colors text-sm text-muted"
              )}
            >
              <Upload size={18} />
              <span>Choose file</span>
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setScreenshot(e.target.files?.[0] || null)
                }
                className="hidden"
              />
            </label>
          ) : (
            <div className="h-12 rounded-2xl border-2 border-muted/20 bg-muted/5 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Upload size={18} className="text-muted flex-shrink-0" />
                <span className="text-sm truncate">{screenshot.name}</span>
                <span className="text-xs text-muted flex-shrink-0">
                  ({(screenshot.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setScreenshot(null)}
                className="text-muted hover:text-foreground transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-1 h-12 w-2xl rounded-2xl text-sm font-semibold text-white",
            "bg-foreground hover:bg-foreground/70"
          )}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </FormShell>
  );
}

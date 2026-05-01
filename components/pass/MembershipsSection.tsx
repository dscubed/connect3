"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Upload,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

type Membership = {
  id: string;
  club_id: string;
  matched_product_name: string;
  verified_email: string;
  verified_at: string | null;
  club: {
    first_name: string | null;
    avatar_url: string | null;
  } | null;
};

type MembershipBinding = {
  verified_email: string;
  first_verified_at: string;
};

type EmailClient = "gmail" | "outlook" | null;

const HOW_TO_STEPS: Record<
  "gmail" | "outlook",
  { title: string; description: string }[]
> = {
  gmail: [
    {
      title: "Find your membership email",
      description:
        "Search for the confirmation email from your club or society in Gmail.",
    },
    {
      title: "Open the email",
      description: "Click on the membership confirmation email to open it.",
    },
    {
      title: "Download as .eml",
      description:
        'Click the three-dot menu (⋮) in the top-right of the email → select "Download message". This saves a .eml file to your device.',
    },
    {
      title: "Upload here",
      description:
        'Click "Upload Receipt" and select the downloaded .eml file.',
    },
  ],
  outlook: [
    {
      title: "Find your membership email",
      description:
        "Search for the confirmation email from your club or society in Outlook.",
    },
    {
      title: "Open the email",
      description: "Click on the membership confirmation email to open it.",
    },
    {
      title: "Save as .eml",
      description:
        'Go to File → Save As, choose a location, and make sure the file type is set to ".eml" or "Outlook Message Format".',
    },
    {
      title: "Upload here",
      description: 'Click "Upload Receipt" and select the saved .eml file.',
    },
  ],
};

const HOW_TO_IMAGES: Partial<Record<"gmail" | "outlook", string[]>> = {
  gmail: [
    "/memberships/gmail_how_to/1-searching.png",
    "/memberships/gmail_how_to/2-opening.png",
    "/memberships/gmail_how_to/3-download.png",
    "/memberships/gmail_how_to/4-upload.png",
  ],
};

function GmailIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#EA4335" d="M6 40h6V23.8L4 18v18c0 2.2 1.8 4 4 4z" />
      <path fill="#34A853" d="M36 40h6c2.2 0 4-1.8 4-4V18l-8 5.8z" />
      <path fill="#FBBC05" d="M36 8l-12 8.7L12 8H6l18 13 18-13z" />
      <path fill="#4285F4" d="M4 18l8 5.8V8H6C3.8 8 2 9.8 2 12v4z" />
      <path fill="#C5221F" d="M44 12v4l-8 5.8V8h6c2.2 0 4 1.8 4 4z" />
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#1976D2"
        d="M28 8h14c1.1 0 2 .9 2 2v28c0 1.1-.9 2-2 2H28V8z"
      />
      <path
        fill="#fff"
        d="M30 16h10v2H30zm0 4h10v2H30zm0 4h10v2H30zm0 4h6v2h-6z"
      />
      <path fill="#1565C0" d="M28 8v32L4 36V12z" />
      <ellipse cx="16" cy="24" rx="6" ry="7" fill="#fff" />
      <ellipse cx="16" cy="24" rx="4" ry="5" fill="#1976D2" />
    </svg>
  );
}

export default function MembershipsSection() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [binding, setBinding] = useState<MembershipBinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [emailClient, setEmailClient] = useState<EmailClient>(null);
  const [howToStep, setHowToStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const steps = emailClient ? HOW_TO_STEPS[emailClient] : [];
  const stepImages = emailClient ? HOW_TO_IMAGES[emailClient] ?? [] : [];

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memberships/me");
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to load memberships");
      }

      setBinding(body.data?.binding ?? null);
      setMemberships(body.data?.memberships ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load memberships",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemberships();
  }, [loadMemberships]);

  const openHowTo = () => {
    setEmailClient(null);
    setHowToStep(0);
    setHowToOpen(true);
  };

  const closeHowTo = () => {
    setHowToOpen(false);
    setEmailClient(null);
    setHowToStep(0);
  };

  const handleEmlUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", selectedFile);

      const res = await fetch("/api/memberships/verify-receipt", {
        method: "POST",
        body: formData,
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to verify receipt");
      }

      const verifiedClubs = body.data?.verifiedClubs ?? [];
      const names = verifiedClubs
        .map(
          (club: { club?: { first_name?: string | null } | null }) =>
            club.club?.first_name,
        )
        .filter(Boolean);

      toast.success(
        names.length > 0
          ? `Verified membership for ${names.join(", ")}`
          : "Membership receipt verified",
      );
      setUploadOpen(false);
      setSelectedFile(null);
      await loadMemberships();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify receipt",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base text-foreground">
            Club Memberships
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={openHowTo}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              How to
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Receipt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading memberships...
            </p>
          ) : memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No memberships verified yet. Upload a receipt to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {memberships.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-medium text-sm truncate">
                        {m.club?.first_name ?? "Club membership"}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {m.matched_product_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.verified_at ? (
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.verified_at).toLocaleDateString()}
                      </span>
                    ) : null}
                    <Badge variant="default" className="text-xs">
                      Verified
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {binding && (
            <p className="mt-3 text-xs text-muted-foreground">
              Receipt email: {binding.verified_email}
            </p>
          )}
        </CardContent>
      </Card>

      {/* How to dialog */}
      <Dialog
        open={howToOpen}
        onOpenChange={(o) => {
          if (!o) closeHowTo();
          else setHowToOpen(true);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to get your .eml file</DialogTitle>
            <DialogDescription>
              {emailClient
                ? `Step ${howToStep + 1} of ${steps.length} · ${emailClient === "gmail" ? "Gmail" : "Outlook"}`
                : "Choose your email app"}
            </DialogDescription>
          </DialogHeader>

          {!emailClient ? (
            /* Client picker */
            <div className="flex gap-4 py-4 justify-center">
              {(["gmail", "outlook"] as const).map((client) => (
                <button
                  key={client}
                  onClick={() => {
                    setEmailClient(client);
                    setHowToStep(0);
                  }}
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                  {client === "gmail" ? <GmailIcon /> : <OutlookIcon />}
                  <span className="text-sm font-medium capitalize">
                    {client}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Steps */
            <div className="space-y-4 py-2">
              {stepImages[howToStep] ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={stepImages[howToStep]}
                    alt={steps[howToStep].title}
                    width={1200}
                    height={900}
                    className="h-auto w-full"
                  />
                </div>
              ) : (
                <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm border border-border">
                  Screenshot coming soon
                </div>
              )}
              <div className="space-y-1">
                <p className="font-medium text-sm">{steps[howToStep].title}</p>
                <p className="text-sm text-muted-foreground">
                  {steps[howToStep].description}
                </p>
              </div>
              <div className="flex justify-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHowToStep(i)}
                    className={`h-1.5 rounded-full transition-all ${i === howToStep ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
          )}

          {emailClient && (
            <DialogFooter className="flex-row justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  howToStep === 0
                    ? setEmailClient(null)
                    : setHowToStep((s) => s - 1)
                }
              >
                <ChevronLeft className="h-4 w-4" />
                {howToStep === 0 ? "Back" : "Back"}
              </Button>
              {howToStep < steps.length - 1 ? (
                <Button size="sm" onClick={() => setHowToStep((s) => s + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    closeHowTo();
                    setUploadOpen(true);
                  }}
                >
                  Upload Receipt
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Membership Receipt</DialogTitle>
            <DialogDescription>
              Upload your club membership confirmation email (.eml) for
              verification. We&apos;ll verify its DKIM signature and match it to
              participating club products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-sm">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select a .eml file"}
                </span>
              </div>
              <input
                type="file"
                accept=".eml,message/rfc822"
                className="sr-only"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {selectedFile && (
              <p className="text-xs text-muted-foreground text-center">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadOpen(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmlUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Verifying..." : "Verify Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

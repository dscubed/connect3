"use client";

import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Button } from "@/components/ui/button";

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
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  ChevronDown,
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
    <Image src="/memberships/gmail.svg" alt="Gmail" width={32} height={32} />
  );
}

function OutlookIcon() {
  return (
    <Image
      src="/memberships/outlook.svg"
      alt="Outlook"
      width={32}
      height={32}
    />
  );
}

function MembershipItem({ membership: m }: { membership: Membership }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (m.club?.first_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <li className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Avatar */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 overflow-hidden flex items-center justify-center">
          {m.club?.avatar_url ? (
            <Image
              src={m.club.avatar_url}
              alt={m.club.first_name ?? "Club"}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-xs font-semibold text-purple-600">
              {initials}
            </span>
          )}
        </div>

        {/* Name */}
        <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
          {m.club?.first_name ?? "Club membership"}
        </span>

        {/* Verified + chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <BadgeCheck className="h-5 w-5 text-[#854ECB]" />
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0.5 flex flex-col gap-0.5 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-muted-foreground">
            {m.matched_product_name}
          </p>
          {m.verified_at && (
            <p className="text-xs text-muted-foreground">
              Verified {new Date(m.verified_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export interface MembershipsSectionHandle {
  openHowTo: () => void;
  openUpload: () => void;
}

const MembershipsSection = forwardRef<MembershipsSectionHandle>(
  function MembershipsSection(_props, ref) {
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
    const stepImages = emailClient ? (HOW_TO_IMAGES[emailClient] ?? []) : [];

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

    useImperativeHandle(ref, () => ({
      openHowTo,
      openUpload: () => setUploadOpen(true),
    }));

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
        <div>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading memberships…
            </p>
          ) : memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No memberships verified yet. Upload a receipt to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {memberships.map((m) => (
                <MembershipItem key={m.id} membership={m} />
              ))}
            </ul>
          )}
          {binding && (
            <p className="mt-3 text-xs text-muted-foreground">
              Receipt email: {binding.verified_email}
            </p>
          )}
        </div>

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
                  <p className="font-medium text-sm">
                    {steps[howToStep].title}
                  </p>
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
                verification. We&apos;ll verify its DKIM signature and match it
                to participating club products.
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
  },
);

export default MembershipsSection;

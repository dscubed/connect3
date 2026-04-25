"use client";

import { useState } from "react";
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
  Clock,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

type Membership = {
  id: string;
  club_name: string;
  verified_at: string | null;
  status: string;
};

type EmailClient = "gmail" | "outlook" | null;

const HOW_TO_STEPS: Record<"gmail" | "outlook", { title: string; description: string }[]> = {
  gmail: [
    {
      title: "Find your membership email",
      description: 'Search for the confirmation email from your club or society in Gmail.',
    },
    {
      title: "Open the email",
      description: "Click on the membership confirmation email to open it.",
    },
    {
      title: "Download as .eml",
      description: 'Click the three-dot menu (⋮) in the top-right of the email → select "Download message". This saves a .eml file to your device.',
    },
    {
      title: "Upload here",
      description: 'Click "Upload Receipt" and select the downloaded .eml file.',
    },
  ],
  outlook: [
    {
      title: "Find your membership email",
      description: "Search for the confirmation email from your club or society in Outlook.",
    },
    {
      title: "Open the email",
      description: "Click on the membership confirmation email to open it.",
    },
    {
      title: "Save as .eml",
      description: 'Go to File → Save As, choose a location, and make sure the file type is set to ".eml" or "Outlook Message Format".',
    },
    {
      title: "Upload here",
      description: 'Click "Upload Receipt" and select the saved .eml file.',
    },
  ],
};

function GmailIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
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
    <svg viewBox="0 0 48 48" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1976D2" d="M28 8h14c1.1 0 2 .9 2 2v28c0 1.1-.9 2-2 2H28V8z" />
      <path fill="#fff" d="M30 16h10v2H30zm0 4h10v2H30zm0 4h10v2H30zm0 4h6v2h-6z" />
      <path fill="#1565C0" d="M28 8v32L4 36V12z" />
      <ellipse cx="16" cy="24" rx="6" ry="7" fill="#fff" />
      <ellipse cx="16" cy="24" rx="4" ry="5" fill="#1976D2" />
    </svg>
  );
}

export default function MembershipsSection() {
  const [memberships] = useState<Membership[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [emailClient, setEmailClient] = useState<EmailClient>(null);
  const [howToStep, setHowToStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const steps = emailClient ? HOW_TO_STEPS[emailClient] : [];

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
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Receipt submitted for review");
    setUploadOpen(false);
    setSelectedFile(null);
    setUploading(false);
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
          {memberships.length === 0 ? (
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
                    {m.status === "verified" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">{m.club_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.verified_at ? (
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.verified_at).toLocaleDateString()}
                      </span>
                    ) : null}
                    <Badge
                      variant={m.status === "verified" ? "default" : "secondary"}
                      className="text-xs capitalize"
                    >
                      {m.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* How to dialog */}
      <Dialog open={howToOpen} onOpenChange={(o) => { if (!o) closeHowTo(); else setHowToOpen(true); }}>
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
                  onClick={() => { setEmailClient(client); setHowToStep(0); }}
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                  {client === "gmail" ? <GmailIcon /> : <OutlookIcon />}
                  <span className="text-sm font-medium capitalize">{client}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Steps */
            <div className="space-y-4 py-2">
              <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm border border-border">
                Screenshot coming soon
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{steps[howToStep].title}</p>
                <p className="text-sm text-muted-foreground">{steps[howToStep].description}</p>
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
                onClick={() => howToStep === 0 ? setEmailClient(null) : setHowToStep((s) => s - 1)}
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
                <Button size="sm" onClick={() => { closeHowTo(); setUploadOpen(true); }}>
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
              Upload your club membership confirmation email (.eml) for verification. We&apos;ll review it and update your membership status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-sm">
                  {selectedFile ? selectedFile.name : "Click to select a .eml file"}
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
              onClick={() => { setUploadOpen(false); setSelectedFile(null); }}
            >
              Cancel
            </Button>
            <Button onClick={handleEmlUpload} disabled={!selectedFile || uploading}>
              {uploading ? "Uploading..." : "Submit for Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

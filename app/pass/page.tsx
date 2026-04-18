"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const CLUB = {
  displayName: "Data Science Student Society",
  logoUrl: "https://c3-pass-assets.vercel.app/clubs/dscubed-logo.png",
};

function PassPageContent() {
  const router = useRouter();
  const { user, profile, loading, profileLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedMemberId, setGeneratedMemberId] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [googlePassUrl, setGooglePassUrl] = useState<string | null>(null);
  const [applePassData, setApplePassData] = useState<{ type: string; data: number[] } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasGenerated = useRef(false);

  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";
  const email = user?.email ?? "";

  const updatePreview = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error("Preview generation failed", err);
    }
  }, []);

  // Preload images
  useEffect(() => {
    const imageUrls = [
      "https://c3-pass-assets.vercel.app/web-wallet/background.png",
      "https://c3-pass-assets.vercel.app/web-wallet/characters.png",
    ];
    Promise.all(
      imageUrls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new window.Image();
            img.src = url;
            img.crossOrigin = "anonymous";
            img.onload = resolve;
            img.onerror = resolve;
          }),
      ),
    ).then(() => updatePreview());
  }, [updatePreview]);

  // Update preview on name changes
  useEffect(() => {
    const timer = setTimeout(() => updatePreview(), 100);
    return () => clearTimeout(timer);
  }, [firstName, lastName, generatedMemberId, updatePreview]);

  // Redirect logged-out users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // Auto-generate pass once profile is loaded
  useEffect(() => {
    if (hasGenerated.current) return;
    if (!user || !profile || profileLoading) return;
    if (!firstName || !email) return;

    hasGenerated.current = true;
    generatePass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, profileLoading, firstName, email]);

  const generatePass = async () => {
    if (!firstName || !email) {
      toast.error("Missing profile information");
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/pass", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        if (data.memberId) {
          setGeneratedMemberId(data.memberId);
        }
        if (data.googlePassUrl) setGooglePassUrl(data.googlePassUrl);
        if (data.applePassData) setApplePassData(data.applePassData);
        toast.success("Pass generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate pass");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "membership-card.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Failed to download image");
    }
  };

  if (loading || (!user && !loading)) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="flex flex-col md:flex-row h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
            <h1 className="text-2xl font-semibold text-foreground mb-6">
              Your Membership Pass
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Card Preview */}
              <div className="flex flex-col items-center gap-4">
                {/* Hidden source for html-to-image */}
                <div
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    ref={cardRef}
                    className="relative w-[380px] max-w-full aspect-[3/4] rounded-2xl shadow-xl flex flex-col items-center gap-3 overflow-hidden text-white p-4 select-none font-fredoka"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://c3-pass-assets.vercel.app/web-wallet/background.png"
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ zIndex: -1 }}
                      crossOrigin="anonymous"
                      onLoad={() => updatePreview()}
                    />

                    <div className="flex gap-2 items-center w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={CLUB.logoUrl}
                        alt={CLUB.displayName}
                        className="w-8 h-8 object-contain rounded-full"
                        crossOrigin="anonymous"
                        onLoad={() => updatePreview()}
                      />
                      <span
                        className="truncate line-clamp-1"
                        style={{ textShadow: "0 0 5px rgba(0,0,0,0.3)" }}
                      >
                        {CLUB.displayName}
                      </span>
                    </div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://c3-pass-assets.vercel.app/web-wallet/characters.png"
                      alt="Characters"
                      className="w-64 h-auto object-contain"
                      crossOrigin="anonymous"
                      onLoad={() => updatePreview()}
                    />

                    <div className="w-full">
                      <div className="text-xs opacity-70">Name</div>
                      <div className="text-lg font-medium tracking-wide">
                        {firstName || lastName
                          ? `${firstName} ${lastName}`.trim()
                          : "------- ---"}
                      </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center mt-auto">
                      {generatedMemberId ? (
                        <QRCode
                          size={256}
                          style={{ height: "auto" }}
                          value={generatedMemberId}
                          viewBox="0 0 256 256"
                          className="w-28 h-28 p-2.5 bg-white rounded-lg"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-white/40 rounded-lg" />
                      )}
                    </div>

                    <p className="opacity-50 text-sm text-center mt-auto">
                      Powered by Connect3
                    </p>
                  </div>
                </div>

                {/* Visible preview */}
                <div className="w-full max-w-[500px] aspect-[3/4] flex items-center justify-center rounded-2xl shadow-xl overflow-hidden bg-primary/20">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Membership Card Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted">
                      Loading Preview...
                    </div>
                  )}
                </div>

                {generatedMemberId && (
                  <div className="flex flex-col items-center gap-3 mt-2">
                    <Button variant="link" onClick={handleDownloadImage}>
                      Download Card as Image
                    </Button>
                  </div>
                )}
              </div>

              {/* Info card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {CLUB.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {firstName} {lastName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{email}</p>
                    </div>
                    {generating && (
                      <p className="text-sm text-muted-foreground">
                        Generating your pass...
                      </p>
                    )}
                    {generatedMemberId && (
                      <div className="flex gap-3 pt-2">
                        {applePassData && (
                          <button
                            onClick={() => {
                              const blob = new Blob(
                                [new Uint8Array(applePassData.data)],
                                { type: "application/vnd.apple.pkpass" },
                              );
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "membership.pkpass";
                              a.click();
                              window.URL.revokeObjectURL(url);
                            }}
                            className="inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/apple-wallet-button.svg"
                              alt="Add to Apple Wallet"
                              className="h-10 w-auto"
                            />
                          </button>
                        )}
                        {googlePassUrl && (
                          <a
                            href={googlePassUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/google-wallet-button.svg"
                              alt="Add to Google Wallet"
                              className="h-10 w-auto"
                            />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PassPage() {
  return (
    <Suspense>
      <PassPageContent />
    </Suspense>
  );
}

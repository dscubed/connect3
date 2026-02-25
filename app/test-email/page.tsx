"use client";

import { useState } from "react";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { type Event } from "@/lib/schemas/events/event";

const MOCK_EVENT: Event = {
  id: "test-event-1",
  name: "DSCubed x MMSA Career Networking Night",
  creatorProfileId: "00000000-0000-0000-0000-000000000001",
  description:
    "## Welcome!\n\nJoin us for an evening of networking with industry professionals and fellow students. Spots are limited so don't miss out on this chance and sign up in our bio asap!\n\n**Cost:** $10 (member) | $12 (non-member)\n\n📍 Freshwater Pl, Southbank VIC 3006",
  bookingUrl: "https://example.com/tickets",
  start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 150).toISOString(),
  publishedAt: new Date().toISOString(),
  capacity: 100,
  thumbnail: undefined,
  currency: "AUD",
  category: "Career Networking",
  isOnline: false,
  location: {
    venue: "TBA",
    address: "Freshwater Pl",
    latitude: -37.82,
    longitude: 144.96,
    city: "Melbourne",
    country: "Australia",
  },
  pricing: { min: 10, max: 12 },
  source: "instagram",
};

export default function TestPage() {
  const [tab, setTab] = useState<"event" | "impersonate">("event");

  // Impersonation state
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    setLoading(true);
    setMagicLink(null);
    setError(null);
    try {
      const res = await fetch("/api/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unknown error");
      } else {
        setMagicLink(data.magicLink);
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Dev Tools</h1>
        <p className="mb-6 text-sm text-gray-400">Internal test page — not for production use.</p>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(["event", "impersonate"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 px-1 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "event" ? "Event UI Preview" : "Impersonate User"}
            </button>
          ))}
        </div>

        {tab === "event" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <EventDetailPanel event={MOCK_EVENT} />
          </div>
        )}

        {tab === "impersonate" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Generates an impersonation magic link for any user. Requires the{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">IMPERSONATE_SECRET_KEY</code>{" "}
                env var set server-side.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  User Email
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Secret Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  onKeyDown={(e) => e.key === "Enter" && handleImpersonate()}
                />
              </div>
              <button
                onClick={handleImpersonate}
                disabled={loading || !email || !secret}
                className="w-full rounded-lg bg-purple-500 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Magic Link"}
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {magicLink && (
              <div className="space-y-2">
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-green-700">Magic link generated</p>
                  <p className="break-all text-xs text-green-600">{magicLink}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(magicLink)}
                    className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Copy Link
                  </button>
                  <a
                    href={magicLink}
                    className="flex-1 rounded-lg bg-purple-500 py-2 text-center text-xs font-medium text-white hover:bg-purple-600"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

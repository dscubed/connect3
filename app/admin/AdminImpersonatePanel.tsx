"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminImpersonatePanel() {
  const [email, setEmail] = useState("");
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImpersonate = async () => {
    setLoading(true);
    setMagicLink(null);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  const handleCopy = () => {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-base font-semibold text-gray-900">
        Impersonate User
      </h2>
      <p className="mb-5 text-sm text-gray-400">
        Generates a magic link to sign in as any user.
      </p>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            User Email
          </label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleImpersonate()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <button
          onClick={handleImpersonate}
          disabled={loading || !email}
          className="w-full rounded-lg bg-purple-500 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Magic Link"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {magicLink && (
        <div className="mt-4 space-y-2">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-green-700">
              Magic link generated
            </p>
            <p className="break-all text-xs text-green-600">{magicLink}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}

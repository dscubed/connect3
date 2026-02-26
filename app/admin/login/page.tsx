"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP");
      } else {
        setStep("otp");
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid OTP");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Admin Access</h1>
        <p className="mb-6 text-sm text-gray-400">
          {step === "email"
            ? "Enter your authorised email to receive a one-time code."
            : `A 6-digit code was sent to ${email}.`}
        </p>

        {step === "email" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="w-full rounded-lg bg-purple-500 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                One-time code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-lg font-mono tracking-widest outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-purple-500 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
              }}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
            >
              Use a different email
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

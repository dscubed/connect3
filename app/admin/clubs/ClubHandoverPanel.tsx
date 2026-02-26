"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dice6 } from "lucide-react";
function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = uppercase + lowercase + digits + special;

  let password = "";
  for (let i = 0; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }
  return password;
}
function ClubAvatar({
  name,
  avatarUrl,
  size = 40,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-purple-100"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-semibold text-purple-600">{initials}</span>
    </div>
  );
}

interface Club {
  id: string;
  first_name: string;
  university: string | null;
  avatar_url: string | null;
  email: string | null;
}

export default function ClubHandoverPanel() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchClubs = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/clubs");
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error ?? "Failed to load clubs");
      } else {
        setClubs(data.data);
      }
    } catch {
      setFetchError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleHandover = async () => {
    if (!selectedClub) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch("/api/admin/clubs/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: selectedClub.id,
          newEmail,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Handover failed");
      } else {
        setSubmitSuccess(true);
        setSelectedClub(null);
        setNewEmail("");
        setNewPassword("");
        fetchClubs();
      }
    } catch {
      setSubmitError("Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm">
        <p className="text-sm">Loading clubs...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-600">{fetchError}</p>
        <button
          onClick={fetchClubs}
          className="mt-3 text-xs font-medium text-red-500 hover:text-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (selectedClub) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClubAvatar
                name={selectedClub.first_name}
                avatarUrl={selectedClub.avatar_url}
                size={44}
              />
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Transfer: {selectedClub.first_name}
                </h2>
                <p className="text-sm text-gray-400">
                  Current email: {selectedClub.email ?? "—"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedClub(null);
                setNewEmail("");
                setNewPassword("");
                setSubmitError(null);
                setSubmitSuccess(false);
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                New Email
              </label>
              <input
                type="email"
                placeholder="newholder@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Temporary Password
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
                <button
                  type="button"
                  onClick={() => setNewPassword(generatePassword(12))}
                  title="Generate random password"
                  className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                >
                  <Dice6 size={16} />
                </button>
              </div>
            </div>
            <button
              onClick={handleHandover}
              disabled={submitting || !newEmail || newPassword.length < 6}
              className="w-full rounded-lg bg-purple-500 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
            >
              {submitting ? "Transferring..." : "Transfer Account"}
            </button>
          </div>

          {submitError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submitSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          Account transferred successfully.
        </div>
      )}

      {clubs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm">
          <p className="text-sm">No clubs found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-3">
            <p className="text-xs font-medium text-gray-400">
              {clubs.length} club{clubs.length !== 1 && "s"}
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {clubs.map((club) => (
              <li
                key={club.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ClubAvatar
                    name={club.first_name}
                    avatarUrl={club.avatar_url}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {club.first_name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {club.email ?? "No email"}{" "}
                      {club.university && `· ${club.university}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClub(club)}
                  className="ml-4 shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Transfer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import Image from "next/image";

type ProfileResult = {
  id: string;
  first_name: string;
  avatar_url: string | null;
  account_type: "user" | "organisation";
  email: string | null;
};

type TypeFilter = "user" | "organisation";

export default function AdminImpersonatePanel() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileResult | null>(null);
  const [typeFilters, setTypeFilters] = useState<TypeFilter[]>(["user", "organisation"]);

  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfiles = useCallback(async (q: string, types: TypeFilter[]) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      types.forEach((t) => params.append("type", t));
      const res = await fetch(`/api/admin/profiles/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.data ?? []);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!search) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProfiles(search, typeFilters);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, typeFilters, fetchProfiles]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (profile: ProfileResult) => {
    setSelectedProfile(profile);
    setSearch(profile.first_name);
    setShowDropdown(false);
    setMagicLink(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedProfile(null);
    setSearch("");
    setMagicLink(null);
    setError(null);
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const toggleType = (type: TypeFilter) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleImpersonate = async () => {
    const email = selectedProfile?.email ?? null;
    if (!email) return;
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
        Search by name to generate a magic link and sign in as any user.
      </p>

      {/* Type filter checkboxes */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-xs font-medium text-gray-500">Filter by:</span>
        {(
          [
            { value: "user", label: "Users" },
            { value: "organisation", label: "Clubs" },
          ] as { value: TypeFilter; label: string }[]
        ).map(({ value, label }) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600 select-none"
          >
            <input
              type="checkbox"
              checked={typeFilters.includes(value)}
              onChange={() => toggleType(value)}
              className="h-3.5 w-3.5 rounded accent-purple-500"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="space-y-3">
        {/* Search input */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Search by Name
          </label>
          <div className="relative">
            <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search users and clubs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedProfile(null);
                  if (!showDropdown) setShowDropdown(true);
                }}
                onFocus={() => {
                  if (search) setShowDropdown(true);
                }}
                className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
              />
              {searchLoading && (
                <Loader2 className="ml-1 h-4 w-4 animate-spin text-gray-400" />
              )}
              {(search || selectedProfile) && !searchLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden"
              >
                {results.length === 0 && !searchLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    {search ? "No results found" : "Start typing to search"}
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {results.map((profile) => (
                      <li key={profile.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(profile)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        >
                          {/* Avatar */}
                          {profile.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt={profile.first_name}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-gray-500">
                                {profile.first_name.charAt(0).toUpperCase()}
                              </span>
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {profile.first_name}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {profile.email ?? "No email"}
                            </p>
                          </div>

                          {/* Type badge */}
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              profile.account_type === "organisation"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {profile.account_type === "organisation"
                              ? "Club"
                              : "User"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Selected profile info */}
          {selectedProfile && (
            <p className="mt-1.5 text-xs text-gray-400">
              Email:{" "}
              <span className="font-medium text-gray-600">
                {selectedProfile.email ?? "N/A"}
              </span>
            </p>
          )}
        </div>

        <button
          onClick={handleImpersonate}
          disabled={loading || !selectedProfile?.email}
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

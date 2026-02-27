"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload } from "lucide-react";
import ClubPickerDropdown from "../ClubPickerDropdown";
import type { AdminClub } from "@/lib/admin/types";

interface AddSlugFormProps {
  clubs: AdminClub[];
  linkedProfileIds: Set<string>;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function AddSlugForm({
  clubs,
  linkedProfileIds,
  onSuccess,
  onError,
}: AddSlugFormProps) {
  const [slug, setSlug] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram_slug: slug.trim(),
          profile_id: selectedProfileId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSlug("");
      setSelectedProfileId("");
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to add slug");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImportClick() {
    setImporting(true);
    try {
      const parsed = JSON.parse(importJson);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error(
          'Expected a JSON object like { "profile_id": "slug", ... }',
        );
      }
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.warning) onError(json.warning);
      setImportJson("");
      setShowImport(false);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Add Instagram Slug
        </h2>
        <button
          type="button"
          onClick={() => setShowImport((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
        >
          <Upload className="h-3.5 w-3.5" />
          {showImport ? "Hide" : "Bulk Import JSON"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs text-gray-500">
            Instagram Slug
          </label>
          <Input
            placeholder="e.g. dscubed.unimelb"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs text-gray-500">
            Link to Club Profile (leave blank for new)
          </label>
          <ClubPickerDropdown
            value={selectedProfileId}
            onChange={setSelectedProfileId}
            clubs={clubs}
            linkedProfileIds={linkedProfileIds}
            disabled={submitting}
          />
        </div>
        <Button
          type="submit"
          disabled={submitting || !slug.trim()}
          className="h-9 gap-1.5 bg-muted/10 hover:bg-muted/25 text-black"
        >
          <Plus className="h-4 w-4" />
          {submitting ? "Adding\u2026" : "Add to Table"}
        </Button>
      </form>

      {showImport && (
        <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500">
            Paste a JSON object mapping{" "}
            <code className="rounded bg-gray-200 px-1">profile_id</code> to{" "}
            <code className="rounded bg-gray-200 px-1">instagram_slug</code>:
          </p>
          <textarea
            rows={5}
            className="w-full rounded-md border border-gray-200 bg-white p-3 font-mono text-xs text-gray focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none"
            placeholder={`{\n  "uuid-1": "club.instagram",\n  "uuid-2": "another.club"\n}`}
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={importing || !importJson.trim()}
              onClick={handleImportClick}
              className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black"
            >
              <Upload className="h-3.5 w-3.5" />
              {importing ? "Importing\u2026" : "Import"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

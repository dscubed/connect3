"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Pause, Trash2, CalendarClock, X } from "lucide-react";

interface BulkToolbarProps {
  selectedSlugs: string[];
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClearSelection: () => void;
}

export default function BulkToolbar({
  selectedSlugs,
  onSuccess,
  onError,
  onClearSelection,
}: BulkToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [massDate, setMassDate] = useState("");

  async function bulkPatch(body: Record<string, unknown>) {
    if (selectedSlugs.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: selectedSlugs, ...body }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      onClearSelection();
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setLoading(false);
    }
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedSlugs.length} item(s)?`)) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/clubs/instagram?slugs=${selectedSlugs.map(encodeURIComponent).join(",")}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      onClearSelection();
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setLoading(false);
    }
  }

  if (selectedSlugs.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-gray-900">
          {selectedSlugs.length} selected
        </span>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => bulkPatch({ status: "queued" })}
          className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Re-queue
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => bulkPatch({ status: "paused" })}
          className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
        >
          <Pause className="h-3.5 w-3.5" />
          Pause
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => setShowDatePicker((v) => !v)}
          className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Set Last Fetched
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={bulkDelete}
          className="gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        <button
          onClick={onClearSelection}
          className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700 transition"
        >
          Clear
        </button>
      </div>

      {showDatePicker && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
          <label className="text-sm text-gray-600">
            Set{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">
              last_fetched
            </code>{" "}
            to:
          </label>
          <Input
            type="datetime-local"
            value={massDate}
            onChange={(e) => setMassDate(e.target.value)}
            className="max-w-[240px]"
          />
          <Button
            size="sm"
            disabled={!massDate || loading}
            onClick={() => {
              bulkPatch({ last_fetched: new Date(massDate).toISOString() });
              setShowDatePicker(false);
              setMassDate("");
            }}
            className="h-8 bg-muted/10 hover:bg-muted/25 text-black"
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              bulkPatch({ last_fetched: null });
              setShowDatePicker(false);
              setMassDate("");
            }}
          >
            Clear dates
          </Button>
          <button
            onClick={() => {
              setShowDatePicker(false);
              setMassDate("");
            }}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

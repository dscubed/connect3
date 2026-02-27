"use client";

import { useState } from "react";
import { Table as TanTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw } from "lucide-react";
import type { InstagramFetchRow } from "@/lib/admin/types";

interface QuickActionsBarProps {
  table: TanTable<InstagramFetchRow>;
  rowSlugs: string[];
  loading: boolean;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onRefresh: () => void;
}

export default function QuickActionsBar({
  table,
  rowSlugs,
  loading,
  onSuccess,
  onError,
  onRefresh,
}: QuickActionsBarProps) {
  const [requeueLoading, setRequeueLoading] = useState(false);

  async function requeueAll() {
    if (!confirm(`Re-queue all ${rowSlugs.length} items?`)) return;
    setRequeueLoading(true);
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: rowSlugs, status: "queued" }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Requeue all failed");
    } finally {
      setRequeueLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          disabled={rowSlugs.length === 0}
          onClick={() => {
            if (table.getIsAllRowsSelected()) {
              table.toggleAllRowsSelected(false);
            } else {
              table.toggleAllRowsSelected(true);
            }
          }}
          className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black px-3 py-1.5 text-xs font-medium"
        >
          {table.getIsAllRowsSelected() ? "Clear Selection" : "Select All"}
        </Button>
        <Button
          disabled={rowSlugs.length === 0 || requeueLoading}
          onClick={requeueAll}
          className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black px-3 py-1.5 text-xs font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Requeue All ({rowSlugs.length})
        </Button>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}

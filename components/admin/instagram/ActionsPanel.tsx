"use client";

import { Table as TanTable, RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCw,
  Plus,
  RotateCcw,
  Trash2,
  X,
  Pause,
  Upload,
  CalendarClock,
} from "lucide-react";
import ClubPickerDropdown from "../ClubPickerDropdown";
import type { AdminClub, InstagramFetchRow } from "@/lib/admin/types";

interface ActionsPanelProps {
  table: TanTable<InstagramFetchRow>;
  rows: InstagramFetchRow[];
  clubs: AdminClub[];
  linkedProfileIds: Set<string>;
  slug: string;
  selectedProfileId: string;
  submitting: boolean;
  error: string | null;
  showImport: boolean;
  importJson: string;
  importing: boolean;
  showDatePicker: boolean;
  massDate: string;
  selectedCount: number;
  isBulkLoading: boolean;
  loading: boolean;
  onSetSlug: (value: string) => void;
  onSetSelectedProfileId: (value: string) => void;
  onSetError: (error: string | null) => void;
  onSetShowImport: (show: boolean) => void;
  onSetImportJson: (json: string) => void;
  onSetShowDatePicker: (show: boolean) => void;
  onSetMassDate: (date: string) => void;
  onSetRowSelection: (selection: RowSelectionState) => void;
  onHandleAdd: (e: React.FormEvent) => void;
  onHandleImport: () => void;
  onRequeueAll: () => void;
  onFetchRows: () => void;
  onBulkPatch: (body: Record<string, unknown>) => void;
  onBulkDelete: () => void;
}

export default function ActionsPanel({
  table,
  rows,
  clubs,
  linkedProfileIds,
  slug,
  selectedProfileId,
  submitting,
  error,
  showImport,
  importJson,
  importing,
  showDatePicker,
  massDate,
  selectedCount,
  isBulkLoading,
  loading,
  onSetSlug,
  onSetSelectedProfileId,
  onSetError,
  onSetShowImport,
  onSetImportJson,
  onSetShowDatePicker,
  onSetMassDate,
  onSetRowSelection,
  onHandleAdd,
  onHandleImport,
  onRequeueAll,
  onFetchRows,
  onBulkPatch,
  onBulkDelete,
}: ActionsPanelProps) {
  return (
    <>
      {/* ===== Add slug form ===== */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Add Instagram Slug
          </h2>
          <button
            type="button"
            onClick={() => onSetShowImport(!showImport)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
          >
            <Upload className="h-3.5 w-3.5" />
            {showImport ? "Hide" : "Bulk Import JSON"}
          </button>
        </div>

        <form onSubmit={onHandleAdd} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs text-gray-500">
              Instagram Slug
            </label>
            <Input
              placeholder="e.g. dscubed.unimelb"
              value={slug}
              onChange={(e) => onSetSlug(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs text-gray-500">
              Link to Club Profile (leave blank for new)
            </label>
            <ClubPickerDropdown
              value={selectedProfileId}
              onChange={onSetSelectedProfileId}
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

        {/* Bulk JSON import panel */}
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
              onChange={(e) => onSetImportJson(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={importing || !importJson.trim()}
                onClick={onHandleImport}
                className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black"
              >
                <Upload className="h-3.5 w-3.5" />
                {importing ? "Importing\u2026" : "Import"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Error alert ===== */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
          <button
            className="ml-2 font-medium underline"
            onClick={() => onSetError(null)}
          >
            dismiss
          </button>
        </div>
      )}

      {/* ===== Requeue All + Refresh ===== */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            disabled={rows.length === 0}
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
            disabled={rows.length === 0 || isBulkLoading}
            onClick={onRequeueAll}
            className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black px-3 py-1.5 text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Requeue All ({rows.length})
          </Button>
        </div>
        <button
          onClick={() => {
            onSetRowSelection({});
            onFetchRows();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ===== Bulk action toolbar ===== */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-gray-900">
            {selectedCount} selected
          </span>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => onBulkPatch({ status: "queued" })}
            className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-queue
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => onBulkPatch({ status: "paused" })}
            className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
          >
            <Pause className="h-3.5 w-3.5" />
            Pause
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => onSetShowDatePicker(!showDatePicker)}
            className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Set Last Fetched
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={onBulkDelete}
            className="gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <button
            onClick={() => onSetRowSelection({})}
            className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* ===== Mass last_fetched date picker ===== */}
      {showDatePicker && selectedCount > 0 && (
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
            onChange={(e) => onSetMassDate(e.target.value)}
            className="max-w-[240px]"
          />
          <Button
            size="sm"
            disabled={!massDate || isBulkLoading}
            onClick={() => {
              onBulkPatch({ last_fetched: new Date(massDate).toISOString() });
              onSetShowDatePicker(false);
              onSetMassDate("");
            }}
            className="h-8 bg-muted/10 hover:bg-muted/25 text-black"
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isBulkLoading}
            onClick={() => {
              onBulkPatch({ last_fetched: null });
              onSetShowDatePicker(false);
              onSetMassDate("");
            }}
          >
            Clear dates
          </Button>
          <button
            onClick={() => {
              onSetShowDatePicker(false);
              onSetMassDate("");
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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import ClubPickerDropdown from "@/components/admin/ClubPickerDropdown";
import type {
  AdminClub,
  InstagramFetchRow,
  InstagramPost,
} from "@/lib/admin/types";
import { buildColumns } from "./columns";
import EditPanel from "./EditPanel";
import QueueTable from "./QueueTable";
import PostsDialog from "./PostsDialog";

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InstagramQueuePanel() {
  const mountedRef = useRef(true);

  const [rows, setRows] = useState<InstagramFetchRow[]>([]);
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [massDate, setMassDate] = useState("");

  const [viewingSlug, setViewingSlug] = useState<string | null>(null);
  const [viewingResultIds, setViewingResultIds] = useState<Set<string>>(
    new Set(),
  );
  const [viewingPosts, setViewingPosts] = useState<InstagramPost[]>([]);
  const [viewingLoading, setViewingLoading] = useState(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function openResults(slug: string, resultIds: string[]) {
    setViewingSlug(slug);
    setViewingResultIds(new Set(resultIds));
    setViewingPosts([]);
    setViewingLoading(true);
    try {
      const res = await fetch(
        `/api/admin/clubs/instagram/posts?slug=${encodeURIComponent(slug)}`,
      );
      const json = await res.json();
      if (res.ok && mountedRef.current) setViewingPosts(json.data ?? []);
    } finally {
      if (mountedRef.current) setViewingLoading(false);
    }
  }

  function closePostsDialog() {
    setViewingSlug(null);
    setViewingPosts([]);
    setViewingResultIds(new Set());
  }

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingLastFetched, setEditingLastFetched] = useState<string | null>(
    null,
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "updated_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  /* ---- Data fetching ---- */

  const fetchRows = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs/instagram");
      const json = await res.json();
      if (mountedRef.current) {
        if (res.ok) setRows(json.data ?? []);
        else setError(json.error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const fetchClubs = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const res = await fetch("/api/admin/clubs");
      const json = await res.json();
      if (res.ok && mountedRef.current) setClubs(json.data ?? []);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    fetchRows();
    fetchClubs();
  }, [fetchRows, fetchClubs]);

  /* ---- Single actions ---- */

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) return;
    if (!mountedRef.current) return;
    setSubmitting(true);
    setError(null);
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
      if (mountedRef.current) {
        setSlug("");
        setSelectedProfileId("");
      }
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Failed to add slug");
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }

  async function patchSingle(patchSlug: string, body: Record<string, unknown>) {
    if (!mountedRef.current) return;
    setActionLoading(patchSlug);
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagram_slug: patchSlug, ...body }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  async function handleDelete(igSlug: string) {
    if (!confirm(`Delete "${igSlug}"?`)) return;
    if (!mountedRef.current) return;
    setActionLoading(igSlug);
    try {
      const res = await fetch(
        `/api/admin/clubs/instagram?slug=${encodeURIComponent(igSlug)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  /* ---- Filtered data ---- */

  const filteredRows = rows;

  /* ---- Bulk actions ---- */

  function getSelectedSlugs(): string[] {
    return Object.keys(rowSelection)
      .map((idx) => filteredRows[Number(idx)]?.instagram_slug)
      .filter(Boolean);
  }

  async function bulkPatch(body: Record<string, unknown>) {
    const slugs = getSelectedSlugs();
    if (slugs.length === 0) return;
    if (!mountedRef.current) return;
    setActionLoading("__bulk__");
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs, ...body }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      if (mountedRef.current) setRowSelection({});
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  async function bulkDelete() {
    const slugs = getSelectedSlugs();
    if (slugs.length === 0) return;
    if (!confirm(`Delete ${slugs.length} item(s)?`)) return;
    if (!mountedRef.current) return;
    setActionLoading("__bulk__");
    try {
      const res = await fetch(
        `/api/admin/clubs/instagram?slugs=${slugs.map(encodeURIComponent).join(",")}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      if (mountedRef.current) setRowSelection({});
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  async function requeueAll() {
    if (!confirm(`Re-queue all ${rows.length} items?`)) return;
    if (!mountedRef.current) return;
    setActionLoading("__bulk__");
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugs: rows.map((r) => r.instagram_slug),
          status: "queued",
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      if (mountedRef.current) setRowSelection({});
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Requeue all failed");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  /* ---- Bulk JSON import ---- */

  async function handleImport() {
    if (!mountedRef.current) return;
    setImporting(true);
    setError(null);
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
      if (mountedRef.current) {
        if (json.warning) setError(json.warning);
        setImportJson("");
        setShowImport(false);
      }
      fetchRows();
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      if (mountedRef.current) setImporting(false);
    }
  }

  /* ---- Derived sets ---- */

  const linkedProfileIds = new Set(
    rows.map((r) => r.profile_id).filter((id): id is string => id !== null),
  );

  /* ---- Counts for filter pills ---- */

  // Removed - no longer using status filters

  /* ---- Table instance ---- */

  const columns = buildColumns(
    clubs,
    (s) => patchSingle(s, { status: "queued" }),
    handleDelete,
    actionLoading,
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    autoResetPageIndex: false,
    autoResetAll: false,
  });

  const selectedCount = Object.keys(rowSelection).length;
  const isBulkLoading = actionLoading === "__bulk__";

  return (
    <div className="space-y-5">
      {/* ===== Add slug form ===== */}
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

        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
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
              onChange={(e) => setImportJson(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={importing || !importJson.trim()}
                onClick={handleImport}
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
            onClick={() => setError(null)}
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
            onClick={requeueAll}
            className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black px-3 py-1.5 text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Requeue All ({rows.length})
          </Button>
        </div>
        <button
          onClick={() => {
            setRowSelection({});
            fetchRows();
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
            onClick={() => bulkPatch({ status: "queued" })}
            className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-queue
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => bulkPatch({ status: "paused" })}
            className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
          >
            <Pause className="h-3.5 w-3.5" />
            Pause
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => setShowDatePicker((v) => !v)}
            className="gap-1.5 text-xs bg-muted/10 hover:bg-muted/25 text-black"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Set Last Fetched
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={bulkDelete}
            className="gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <button
            onClick={() => setRowSelection({})}
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
            onChange={(e) => setMassDate(e.target.value)}
            className="max-w-[240px]"
          />
          <Button
            size="sm"
            disabled={!massDate || isBulkLoading}
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
            disabled={isBulkLoading}
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

      {/* ===== Edit Row Panel ===== */}
      {editingSlug && (
        <EditPanel
          editingSlug={editingSlug}
          editingProfile={editingProfile}
          editingStatus={editingStatus}
          editingLastFetched={editingLastFetched}
          clubs={clubs}
          linkedProfileIds={linkedProfileIds}
          actionLoading={actionLoading}
          setEditingSlug={setEditingSlug}
          setEditingProfile={setEditingProfile}
          setEditingStatus={setEditingStatus}
          setEditingLastFetched={setEditingLastFetched}
          setActionLoading={setActionLoading}
          setError={setError}
          fetchRows={fetchRows}
        />
      )}

      {/* ===== Data Table + Pagination ===== */}
      <QueueTable
        table={table}
        columns={columns}
        loading={loading}
        editingSlug={editingSlug}
        pageSize={pageSize}
        setPagination={setPagination}
        onViewPosts={openResults}
        onEditRow={(slug, profile, status, lastFetched) => {
          setEditingSlug(slug);
          setEditingProfile(profile);
          setEditingStatus(status);
          setEditingLastFetched(lastFetched);
        }}
      />

      {/* ===== Posts Dialog ===== */}
      <PostsDialog
        viewingSlug={viewingSlug}
        viewingPosts={viewingPosts}
        viewingResultIds={viewingResultIds}
        viewingLoading={viewingLoading}
        onClose={closePostsDialog}
      />
    </div>
  );
}

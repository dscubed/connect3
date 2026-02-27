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
import type {
  AdminClub,
  InstagramFetchRow,
  InstagramPost,
} from "@/lib/admin/types";
import { buildColumns } from "@/components/admin/instagram/columns";
import EditPanel from "@/components/admin/instagram/EditPanel";
import ActionsPanel from "@/components/admin/instagram/ActionsPanel";
import QueueTable from "@/components/admin/instagram/QueueTable";
import PostsDialog from "@/components/admin/instagram/PostsDialog";

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
      <ActionsPanel
        table={table}
        rows={rows}
        clubs={clubs}
        linkedProfileIds={linkedProfileIds}
        slug={slug}
        selectedProfileId={selectedProfileId}
        submitting={submitting}
        error={error}
        showImport={showImport}
        importJson={importJson}
        importing={importing}
        showDatePicker={showDatePicker}
        massDate={massDate}
        selectedCount={selectedCount}
        isBulkLoading={isBulkLoading}
        loading={loading}
        onSetSlug={setSlug}
        onSetSelectedProfileId={setSelectedProfileId}
        onSetError={setError}
        onSetShowImport={setShowImport}
        onSetImportJson={setImportJson}
        onSetShowDatePicker={setShowDatePicker}
        onSetMassDate={setMassDate}
        onSetRowSelection={setRowSelection}
        onHandleAdd={handleAdd}
        onHandleImport={handleImport}
        onRequeueAll={requeueAll}
        onFetchRows={fetchRows}
        onBulkPatch={bulkPatch}
        onBulkDelete={bulkDelete}
      />

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

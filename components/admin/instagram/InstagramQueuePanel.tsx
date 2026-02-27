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
import { buildColumns } from "./columns";
import AddSlugForm from "./AddSlugForm";
import QuickActionsBar from "./QuickActionsBar";
import BulkToolbar from "./BulkToolbar";
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
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [viewingSlug, setViewingSlug] = useState<string | null>(null);
  const [viewingResultIds, setViewingResultIds] = useState<Set<string>>(
    new Set(),
  );
  const [viewingPosts, setViewingPosts] = useState<InstagramPost[]>([]);
  const [viewingLoading, setViewingLoading] = useState(false);

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

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  /* ---- Posts viewer ---- */

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

  /* ---- Single actions ---- */

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

  /* ---- Table ---- */

  const linkedProfileIds = new Set(
    rows.map((r) => r.profile_id).filter((id): id is string => id !== null),
  );

  const columns = buildColumns(
    clubs,
    (s) => patchSingle(s, { status: "queued" }),
    handleDelete,
    actionLoading,
  );

  const table = useReactTable({
    data: rows,
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

  const selectedSlugs = Object.keys(rowSelection)
    .map((idx) => rows[Number(idx)]?.instagram_slug)
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <AddSlugForm
        clubs={clubs}
        linkedProfileIds={linkedProfileIds}
        onSuccess={fetchRows}
        onError={setError}
      />

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

      <QuickActionsBar
        table={table}
        rowSlugs={rows.map((r) => r.instagram_slug)}
        loading={loading}
        onSuccess={fetchRows}
        onError={setError}
        onRefresh={() => {
          setRowSelection({});
          fetchRows();
        }}
      />

      <BulkToolbar
        selectedSlugs={selectedSlugs}
        onSuccess={() => {
          setRowSelection({});
          fetchRows();
        }}
        onError={setError}
        onClearSelection={() => setRowSelection({})}
      />

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

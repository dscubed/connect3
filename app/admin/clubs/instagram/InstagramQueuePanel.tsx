"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Plus,
  RotateCcw,
  Trash2,
  ChevronDown,
  Search,
  X,
  Pause,
  Upload,
  ArrowUpDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CalendarClock,
  Pencil,
  Eye,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FetchRow {
  instagram_slug: string;
  profile_id: string | null;
  last_fetched: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  results: string[];
}

interface Club {
  id: string;
  first_name: string;
  avatar_url: string | null;
}

interface InstagramPost {
  id: string;
  posted_by: string | null;
  caption: string;
  timestamp: number | null;
  location: string | null;
  images: string[];
  collaborators: string[];
  fetched_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  queued: { label: "Queued", bg: "bg-gray-100", text: "text-gray-600" },
  in_progress: {
    label: "In Progress",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  failed: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
  paused: { label: "Paused", bg: "bg-yellow-100", text: "text-yellow-700" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function ClubCell({
  profileId,
  clubs,
}: {
  profileId: string | null;
  clubs: Club[];
}) {
  if (!profileId) return <span className="text-xs text-gray-300">&mdash;</span>;
  const club = clubs.find((c) => c.id === profileId);
  if (!club)
    return (
      <span className="text-xs text-gray-400">
        {profileId.slice(0, 8)}&hellip;
      </span>
    );
  return (
    <span className="flex items-center gap-2">
      {club.avatar_url ? (
        <Image
          src={club.avatar_url}
          alt={club.first_name}
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <span className="text-[10px] font-medium text-gray-600">
            {club.first_name.charAt(0).toUpperCase()}
          </span>
        </span>
      )}
      <span className="truncate text-sm text-gray-700">{club.first_name}</span>
    </span>
  );
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

function buildColumns(
  clubs: Club[],
  onRequeue: (slug: string) => void,
  onDelete: (slug: string) => void,
  actionLoading: string | null,
): ColumnDef<FetchRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "instagram_slug",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center gap-2 text-gray-900"
        >
          Slug
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-700">
          {row.getValue("instagram_slug")}
        </span>
      ),
    },
    {
      accessorKey: "profile_id",
      header: () => <div className="text-gray-900">Linked Profile</div>,
      cell: ({ row }) => (
        <ClubCell profileId={row.getValue("profile_id")} clubs={clubs} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center gap-2 text-gray-900"
        >
          Status
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "last_fetched",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center gap-2 text-gray-900"
        >
          Last Fetched
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>
      ),
      cell: ({ row }) => {
        const val = row.getValue("last_fetched") as string | null;
        return (
          <span className="text-xs text-gray-400">
            {val ? timeAgo(val) : "never"}
          </span>
        );
      },
      sortingFn: (a, b) => {
        const aVal = a.original.last_fetched;
        const bVal = b.original.last_fetched;
        if (!aVal && !bVal) return 0;
        if (!aVal) return -1;
        if (!bVal) return 1;
        return new Date(aVal).getTime() - new Date(bVal).getTime();
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center gap-2 text-gray-900"
        >
          Updated
          <ArrowUpDown className="h-3.5 w-3.5" />
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-gray-400">
          {timeAgo(row.getValue("updated_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-gray-900">Actions</div>,
      cell: ({ row }) => {
        const rowSlug = row.original.instagram_slug;
        const isActioning = actionLoading === rowSlug;
        const canRequeue =
          row.original.status === "completed" ||
          row.original.status === "failed" ||
          row.original.status === "paused";
        return (
          <div className="flex items-center gap-1">
            {canRequeue && (
              <button
                onClick={() => onRequeue(rowSlug)}
                disabled={isActioning}
                title="Re-queue"
                className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(rowSlug)}
              disabled={isActioning}
              title="Delete"
              className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InstagramQueuePanel() {
  const [rows, setRows] = useState<FetchRow[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [clubSearch, setClubSearch] = useState("");
  const clubListRef = useRef<HTMLDivElement>(null);

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
      if (res.ok) setViewingPosts(json.data ?? []);
    } finally {
      setViewingLoading(false);
    }
  }

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editClubSearch, setEditClubSearch] = useState("");
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
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs/instagram");
      const json = await res.json();
      if (res.ok) setRows(json.data ?? []);
      else setError(json.error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClubs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/clubs");
      const json = await res.json();
      if (res.ok) setClubs(json.data ?? []);
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
      setSlug("");
      setSelectedProfileId("");
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add slug");
    } finally {
      setSubmitting(false);
    }
  }

  async function patchSingle(patchSlug: string, body: Record<string, unknown>) {
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
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(igSlug: string) {
    if (!confirm(`Delete "${igSlug}"?`)) return;
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
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionLoading(null);
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
      setRowSelection({});
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function bulkDelete() {
    const slugs = getSelectedSlugs();
    if (slugs.length === 0) return;
    if (!confirm(`Delete ${slugs.length} item(s)?`)) return;
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
      setRowSelection({});
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function requeueAll() {
    if (!confirm(`Re-queue all ${rows.length} items?`)) return;
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
      setRowSelection({});
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Requeue all failed");
    } finally {
      setActionLoading(null);
    }
  }

  /* ---- Bulk JSON import ---- */

  async function handleImport() {
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
      if (json.warning) setError(json.warning);
      setImportJson("");
      setShowImport(false);
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  /* ---- Derived sets ---- */

  const linkedProfileIds = new Set(
    rows.map((r) => r.profile_id).filter(Boolean),
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
            <DropdownMenu
              onOpenChange={(open) => {
                if (!open) setClubSearch("");
              }}
            >
              <DropdownMenuTrigger asChild disabled={submitting}>
                <button
                  type="button"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none"
                >
                  {selectedProfileId ? (
                    <span className="flex items-center gap-2 truncate">
                      {(() => {
                        const c = clubs.find(
                          (cl) => cl.id === selectedProfileId,
                        );
                        if (!c)
                          return <span>{selectedProfileId.slice(0, 8)}…</span>;
                        return (
                          <>
                            {c.avatar_url ? (
                              <Image
                                src={c.avatar_url}
                                alt={c.first_name}
                                width={20}
                                height={20}
                                className="h-5 w-5 shrink-0 rounded-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-[10px] font-medium text-gray-600">
                                  {c.first_name.charAt(0).toUpperCase()}
                                </span>
                              </span>
                            )}
                            <span className="truncate">{c.first_name}</span>
                          </>
                        );
                      })()}
                    </span>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                  <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-[16rem] max-w-[24rem] rounded-lg p-0 shadow-lg"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2 border-b px-3 py-2">
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    autoFocus
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Search className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
                <div
                  ref={clubListRef}
                  className="scrollbar-hide max-h-52 overflow-y-auto py-1"
                >
                  <DropdownMenuItem
                    onClick={() => setSelectedProfileId("")}
                    className={!selectedProfileId ? "font-semibold" : ""}
                  >
                    <span className="text-gray-400">None</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  {(() => {
                    const searched = clubs.filter((c) =>
                      c.first_name
                        .toLowerCase()
                        .includes(clubSearch.toLowerCase()),
                    );
                    const available = searched.filter(
                      (c) => !linkedProfileIds.has(c.id),
                    );
                    const alreadyLinked = searched.filter((c) =>
                      linkedProfileIds.has(c.id),
                    );
                    if (searched.length === 0) {
                      return (
                        <div className="px-3 py-2 text-sm text-gray-400">
                          No clubs found
                        </div>
                      );
                    }
                    return (
                      <>
                        {available.map((club) => (
                          <DropdownMenuItem
                            key={club.id}
                            onClick={() => setSelectedProfileId(club.id)}
                            className={
                              selectedProfileId === club.id
                                ? "font-semibold"
                                : ""
                            }
                          >
                            <span className="flex items-center gap-2">
                              {club.avatar_url ? (
                                <Image
                                  src={club.avatar_url}
                                  alt={club.first_name}
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                  <span className="text-[10px] font-medium text-gray-600">
                                    {club.first_name.charAt(0).toUpperCase()}
                                  </span>
                                </span>
                              )}
                              <span className="truncate">
                                {club.first_name}
                              </span>
                            </span>
                          </DropdownMenuItem>
                        ))}
                        {alreadyLinked.length > 0 && (
                          <>
                            <DropdownMenuSeparator className="my-1" />
                            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Already linked
                            </div>
                            {alreadyLinked.map((club) => (
                              <DropdownMenuItem
                                key={club.id}
                                onClick={() => setSelectedProfileId(club.id)}
                                className="opacity-50"
                              >
                                <span className="flex items-center gap-2">
                                  {club.avatar_url ? (
                                    <Image
                                      src={club.avatar_url}
                                      alt={club.first_name}
                                      width={20}
                                      height={20}
                                      className="h-5 w-5 shrink-0 rounded-full object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                      <span className="text-[10px] font-medium text-gray-600">
                                        {club.first_name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </span>
                                  )}
                                  <span className="truncate">
                                    {club.first_name}
                                  </span>
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
                {selectedProfileId && (
                  <>
                    <DropdownMenuSeparator className="m-0" />
                    <button
                      type="button"
                      onClick={() => setSelectedProfileId("")}
                      className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
        <Button
          disabled={rows.length === 0 || isBulkLoading}
          onClick={requeueAll}
          className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black px-3 py-1.5 text-xs font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Requeue All ({rows.length})
        </Button>
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
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Editing: <span className="font-mono">{editingSlug}</span>
            </h3>
            <button
              onClick={() => {
                setEditingSlug(null);
                setEditingProfile(null);
                setEditingStatus(null);
                setEditingLastFetched(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Linked Profile dropdown */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Linked Profile
              </label>
              <DropdownMenu
                onOpenChange={(open) => {
                  if (!open) setEditClubSearch("");
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none"
                  >
                    {editingProfile ? (
                      <span className="flex items-center gap-2 truncate">
                        {(() => {
                          const c = clubs.find(
                            (cl) => cl.id === editingProfile,
                          );
                          if (!c)
                            return <span>{editingProfile.slice(0, 8)}…</span>;
                          return (
                            <>
                              {c.avatar_url ? (
                                <Image
                                  src={c.avatar_url}
                                  alt={c.first_name}
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                  <span className="text-[10px] font-medium text-gray-600">
                                    {c.first_name.charAt(0).toUpperCase()}
                                  </span>
                                </span>
                              )}
                              <span className="truncate">{c.first_name}</span>
                            </>
                          );
                        })()}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                    <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-[16rem] max-w-[24rem] rounded-lg p-0 shadow-lg"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <input
                      type="text"
                      placeholder="Search clubs..."
                      value={editClubSearch}
                      onChange={(e) => setEditClubSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                      autoFocus
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                  </div>
                  <div className="scrollbar-hide max-h-52 overflow-y-auto py-1">
                    <DropdownMenuItem
                      onClick={() => setEditingProfile(null)}
                      className={!editingProfile ? "font-semibold" : ""}
                    >
                      <span className="text-gray-400">None</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    {(() => {
                      const searched = clubs.filter((c) =>
                        c.first_name
                          .toLowerCase()
                          .includes(editClubSearch.toLowerCase()),
                      );
                      const available = searched.filter(
                        (c) => !linkedProfileIds.has(c.id),
                      );
                      const alreadyLinked = searched.filter((c) =>
                        linkedProfileIds.has(c.id),
                      );
                      if (searched.length === 0) {
                        return (
                          <div className="px-3 py-2 text-sm text-gray-400">
                            No clubs found
                          </div>
                        );
                      }
                      return (
                        <>
                          {available.map((club) => (
                            <DropdownMenuItem
                              key={club.id}
                              onClick={() => setEditingProfile(club.id)}
                              className={
                                editingProfile === club.id
                                  ? "font-semibold"
                                  : ""
                              }
                            >
                              <span className="flex items-center gap-2">
                                {club.avatar_url ? (
                                  <Image
                                    src={club.avatar_url}
                                    alt={club.first_name}
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                    <span className="text-[10px] font-medium text-gray-600">
                                      {club.first_name.charAt(0).toUpperCase()}
                                    </span>
                                  </span>
                                )}
                                <span className="truncate">
                                  {club.first_name}
                                </span>
                              </span>
                            </DropdownMenuItem>
                          ))}
                          {alreadyLinked.length > 0 && (
                            <>
                              <DropdownMenuSeparator className="my-1" />
                              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Already linked
                              </div>
                              {alreadyLinked.map((club) => (
                                <DropdownMenuItem
                                  key={club.id}
                                  onClick={() => setEditingProfile(club.id)}
                                  className="opacity-50"
                                >
                                  <span className="flex items-center gap-2">
                                    {club.avatar_url ? (
                                      <Image
                                        src={club.avatar_url}
                                        alt={club.first_name}
                                        width={20}
                                        height={20}
                                        className="h-5 w-5 shrink-0 rounded-full object-cover"
                                        unoptimized
                                      />
                                    ) : (
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                        <span className="text-[10px] font-medium text-gray-600">
                                          {club.first_name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </span>
                                      </span>
                                    )}
                                    <span className="truncate">
                                      {club.first_name}
                                    </span>
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  {editingProfile && (
                    <>
                      <DropdownMenuSeparator className="m-0" />
                      <button
                        type="button"
                        onClick={() => setEditingProfile(null)}
                        className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear
                      </button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status dropdown */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Status
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none"
                  >
                    {editingStatus ? (
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_CONFIG[editingStatus]?.bg ?? "bg-gray-100"
                        } ${
                          STATUS_CONFIG[editingStatus]?.text ?? "text-gray-600"
                        }`}
                      >
                        {STATUS_CONFIG[editingStatus]?.label ?? editingStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">Select status</span>
                    )}
                    <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-[12rem] rounded-lg p-1 shadow-lg"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setEditingStatus(key)}
                      className={editingStatus === key ? "font-semibold" : ""}
                    >
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                      >
                        {cfg.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Last Fetched */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Last Fetched
              </label>
              <Input
                type="datetime-local"
                value={editingLastFetched || ""}
                onChange={(e) => setEditingLastFetched(e.target.value || null)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setEditingSlug(null);
                setEditingProfile(null);
                setEditingStatus(null);
                setEditingLastFetched(null);
              }}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <Button
              onClick={async () => {
                if (!editingSlug) return;
                setActionLoading(editingSlug);
                try {
                  const updateBody: Record<string, unknown> = {};
                  updateBody.profile_id = editingProfile;
                  updateBody.status = editingStatus;
                  updateBody.last_fetched =
                    editingLastFetched === "" || editingLastFetched === null
                      ? null
                      : new Date(editingLastFetched).toISOString();
                  const res = await fetch("/api/admin/clubs/instagram", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      instagram_slug: editingSlug,
                      ...updateBody,
                    }),
                  });
                  if (!res.ok) {
                    const json = await res.json();
                    throw new Error(json.error);
                  }
                  setEditingSlug(null);
                  setEditingProfile(null);
                  setEditingStatus(null);
                  setEditingLastFetched(null);
                  fetchRows();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Edit failed");
                } finally {
                  setActionLoading(null);
                }
              }}
              disabled={actionLoading === editingSlug}
              className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black"
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* ===== Data Table ===== */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  Loading&hellip;
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  No rows — add a slug above
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    editingSlug === row.original.instagram_slug
                      ? "bg-gray-50"
                      : ""
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.id === `${row.id}_actions` ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              openResults(
                                row.original.instagram_slug,
                                row.original.results ?? [],
                              )
                            }
                            title="View Posts"
                            className="rounded p-1 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSlug(row.original.instagram_slug);
                              setEditingProfile(row.original.profile_id);
                              setEditingStatus(row.original.status);
                              setEditingLastFetched(
                                toDatetimeLocal(row.original.last_fetched),
                              );
                              setEditClubSearch("");
                            }}
                            title="Edit"
                            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPagination((p) => ({
                  ...p,
                  pageIndex: 0,
                  pageSize: Number(e.target.value),
                }));
              }}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="ml-2">
              {table.getFilteredRowModel().rows.length} total
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs text-gray-500">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 bg-muted/10 hover:bg-muted/25 !text-black"
            >
              <ChevronsLeft className="h-4 w-4 " />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 bg-muted/10 hover:bg-muted/25 !text-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 bg-muted/10 hover:bg-muted/25 !text-black"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 bg-muted/10 hover:bg-muted/25 !text-black"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Posts Dialog ===== */}
      <Dialog
        open={!!viewingSlug}
        onOpenChange={(open) => {
          if (!open) {
            setViewingSlug(null);
            setViewingPosts([]);
            setViewingResultIds(new Set());
          }
        }}
      >
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-sm font-semibold">
              Posts for <span className="font-mono">{viewingSlug}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              {viewingLoading
                ? "Loading\u2026"
                : `${viewingPosts.length} post${viewingPosts.length !== 1 ? "s" : ""} linked`}
            </DialogDescription>
          </DialogHeader>

          <div className="scrollbar-hide flex-1 overflow-y-auto">
            {viewingLoading ? (
              <div className="flex h-32 items-center justify-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading posts\u2026
              </div>
            ) : viewingPosts.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-gray-400">
                No posts linked to this slug yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(() => {
                  const newPosts = viewingPosts.filter((p) =>
                    viewingResultIds.has(p.id),
                  );
                  const oldPosts = viewingPosts.filter(
                    (p) => !viewingResultIds.has(p.id),
                  );

                  function PostCard({ post }: { post: InstagramPost }) {
                    return (
                      <div className="flex gap-4 px-6 py-4">
                        {post.images.length > 0 && (
                          <div className="flex shrink-0 gap-1.5">
                            {post.images.slice(0, 2).map((imgUrl, i) => (
                              <div
                                key={i}
                                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                              >
                                <Image
                                  src={imgUrl}
                                  alt={`image ${i + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                {i === 1 && post.images.length > 2 && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-sm font-semibold text-white">
                                    +{post.images.length - 2}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          {post.posted_by && (
                            <p className="text-xs font-medium text-gray-500">
                              @{post.posted_by}
                            </p>
                          )}
                          <p className="line-clamp-3 text-sm text-gray-800">
                            {post.caption || (
                              <span className="italic text-gray-300">
                                No caption
                              </span>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                            {post.timestamp && (
                              <span>
                                {new Date(
                                  post.timestamp * 1000,
                                ).toLocaleDateString("en-AU", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                            {post.location && (
                              <span className="truncate">{post.location}</span>
                            )}
                            {post.collaborators.length > 0 && (
                              <span>
                                with{" "}
                                {post.collaborators
                                  .map((c) => `@${c}`)
                                  .join(", ")}
                              </span>
                            )}
                            <span className="font-mono opacity-50">
                              {post.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      {newPosts.length > 0 && (
                        <>
                          <div className="bg-emerald-50 px-6 py-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                              New — {newPosts.length} post
                              {newPosts.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {newPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </>
                      )}
                      {oldPosts.length > 0 && (
                        <>
                          <div className="bg-gray-50 px-6 py-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Previous — {oldPosts.length} post
                              {oldPosts.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {oldPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

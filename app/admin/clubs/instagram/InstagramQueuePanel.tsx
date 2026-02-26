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
  Link2,
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
}

interface Club {
  id: string;
  first_name: string;
  avatar_url: string | null;
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
    bg: "bg-gray-100",
    text: "text-gray-700",
  },
  completed: {
    label: "Completed",
    bg: "bg-gray-100",
    text: "text-gray-700",
  },
  failed: { label: "Failed", bg: "bg-gray-100", text: "text-gray-700" },
  paused: { label: "Paused", bg: "bg-gray-100", text: "text-gray-700" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700">
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
  onPause: (slug: string) => void,
  onDelete: (slug: string) => void,
  onLink: (slug: string) => void,
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
        const s = row.original.status;
        const rowSlug = row.original.instagram_slug;
        const isActioning = actionLoading === rowSlug;
        const canRequeue =
          s === "completed" || s === "failed" || s === "paused";
        const canPause = s === "queued" || s === "in_progress";
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
            {canPause && (
              <button
                onClick={() => onPause(rowSlug)}
                disabled={isActioning}
                title="Pause"
                className="rounded p-1 text-gray-400 transition hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40"
              >
                <Pause className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onLink(rowSlug)}
              disabled={isActioning}
              title="Set linked profile"
              className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
            >
              <Link2 className="h-4 w-4" />
            </button>
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

  const [linkingSlug, setLinkingSlug] = useState<string | null>(null);
  const [linkSearch, setLinkSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "updated_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(20);

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
    if (!confirm(`Delete "${igSlug}" from the queue?`)) return;
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

  async function handleLinkProfile(igSlug: string, profileId: string | null) {
    setActionLoading(igSlug);
    try {
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram_slug: igSlug,
          profile_id: profileId,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      setLinkingSlug(null);
      setLinkSearch("");
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link profile");
    } finally {
      setActionLoading(null);
    }
  }

  /* ---- Filtered data ---- */

  const filteredRows =
    statusFilter === "all"
      ? rows
      : rows.filter((r) => r.status === statusFilter);

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
    if (!confirm(`Delete ${slugs.length} item(s) from the queue?`)) return;
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

  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  /* ---- Table instance ---- */

  const columns = buildColumns(
    clubs,
    (s) => patchSingle(s, { status: "queued" }),
    (s) => patchSingle(s, { status: "paused" }),
    handleDelete,
    (s) => {
      setLinkingSlug(s);
      setLinkSearch("");
    },
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
      pagination: { pageIndex: 0, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = Object.keys(rowSelection).length;
  const isBulkLoading = actionLoading === "__bulk__";

  /* ---- Render ---- */

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
              Link to Club Profile (optional)
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
            className="h-9 gap-1.5 bg-muted/20 hover:bg-muted/40 text-black"
          >
            <Plus className="h-4 w-4" />
            {submitting ? "Adding\u2026" : "Add to Queue"}
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
                className="gap-1.5 bg-muted/20 hover:bg-muted/40 text-black"
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

      {/* ===== Filter pills + refresh ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            "all",
            "queued",
            "in_progress",
            "completed",
            "failed",
            "paused",
          ].map((s) => {
            const isActive = statusFilter === s;
            const count = s === "all" ? rows.length : (counts[s] ?? 0);
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setRowSelection({});
                  table.setPageIndex(0);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "All" : (STATUS_CONFIG[s]?.label ?? s)}{" "}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
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
            className="gap-1.5 text-xs bg-muted/20 hover:bg-muted/40 text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-queue
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => bulkPatch({ status: "paused" })}
            className="gap-1.5 text-xs bg-muted/20 hover:bg-muted/40 text-black"
          >
            <Pause className="h-3.5 w-3.5" />
            Pause
          </Button>
          <Button
            size="sm"
            disabled={isBulkLoading}
            onClick={() => setShowDatePicker((v) => !v)}
            className="gap-1.5 text-xs bg-muted/20 hover:bg-muted/40 text-black"
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
            className="h-8 bg-muted/20 hover:bg-muted/40 text-black"
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

      {/* ===== Link profile picker ===== */}
      {linkingSlug && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
          <span className="text-sm text-gray-600">
            Link <span className="font-mono font-semibold">{linkingSlug}</span>{" "}
            to:
          </span>
          <div className="relative min-w-[240px] flex-1">
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                autoFocus
              />
            </div>
            {linkSearch && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {(() => {
                  const searched = clubs.filter((c) =>
                    c.first_name
                      .toLowerCase()
                      .includes(linkSearch.toLowerCase()),
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
                        <button
                          key={club.id}
                          type="button"
                          onClick={() =>
                            handleLinkProfile(linkingSlug, club.id)
                          }
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
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
                          <span className="truncate">{club.first_name}</span>
                        </button>
                      ))}
                      {alreadyLinked.length > 0 && (
                        <>
                          <div className="mt-1 border-t border-gray-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Already linked
                          </div>
                          {alreadyLinked.map((club) => (
                            <button
                              key={club.id}
                              type="button"
                              onClick={() =>
                                handleLinkProfile(linkingSlug, club.id)
                              }
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm opacity-50 hover:bg-gray-50"
                            >
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
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLinkProfile(linkingSlug, null)}
          >
            Unlink
          </Button>
          <button
            onClick={() => {
              setLinkingSlug(null);
              setLinkSearch("");
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
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
                  {statusFilter !== "all"
                    ? `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase() ?? statusFilter} items`
                    : "Queue is empty \u2014 add a slug above"}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                setPageSize(Number(e.target.value));
                table.setPageIndex(0);
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
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

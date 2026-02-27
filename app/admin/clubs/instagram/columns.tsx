"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Trash2, ArrowUpDown } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { timeAgo } from "@/lib/admin/utils";
import type { AdminClub, InstagramFetchRow } from "@/lib/admin/types";

export function ClubCell({
  profileId,
  clubs,
}: {
  profileId: string | null;
  clubs: AdminClub[];
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

export function buildColumns(
  clubs: AdminClub[],
  onRequeue: (slug: string) => void,
  onDelete: (slug: string) => void,
  actionLoading: string | null,
): ColumnDef<InstagramFetchRow>[] {
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

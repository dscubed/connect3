"use client";

import React from "react";
import { Table as TanTable, ColumnDef } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eye,
  Pencil,
} from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { toDatetimeLocal } from "@/lib/admin/utils";
import type { InstagramFetchRow } from "@/lib/admin/types";

interface QueueTableProps {
  table: TanTable<InstagramFetchRow>;
  columns: ColumnDef<InstagramFetchRow>[];
  loading: boolean;
  editingSlug: string | null;
  pageSize: number;
  setPagination: React.Dispatch<
    React.SetStateAction<{ pageIndex: number; pageSize: number }>
  >;
  onViewPosts: (slug: string, resultIds: string[]) => void;
  onEditRow: (
    slug: string,
    profile: string | null,
    status: string | null,
    lastFetched: string | null,
  ) => void;
}

export default function QueueTable({
  table,
  columns,
  loading,
  editingSlug,
  pageSize,
  setPagination,
  onViewPosts,
  onEditRow,
}: QueueTableProps) {
  return (
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
          {loading && table.getRowModel().rows.length === 0 ? (
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
                            onViewPosts(
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
                          onClick={() =>
                            onEditRow(
                              row.original.instagram_slug,
                              row.original.profile_id,
                              row.original.status,
                              toDatetimeLocal(row.original.last_fetched),
                            )
                          }
                          title="Edit"
                          className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination footer */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3">
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
            <ChevronsLeft className="h-4 w-4" />
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
  );
}

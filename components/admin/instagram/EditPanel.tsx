"use client";

import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ClubPickerDropdown from "@/components/admin/ClubPickerDropdown";
import { STATUS_CONFIG } from "@/lib/admin/instagram";
import type { AdminClub } from "@/lib/admin/types";

interface EditPanelProps {
  editingSlug: string;
  editingProfile: string | null;
  editingStatus: string | null;
  editingLastFetched: string | null;
  clubs: AdminClub[];
  linkedProfileIds: Set<string>;
  actionLoading: string | null;
  setEditingSlug: (slug: string | null) => void;
  setEditingProfile: (id: string | null) => void;
  setEditingStatus: (status: string | null) => void;
  setEditingLastFetched: (date: string | null) => void;
  setActionLoading: (slug: string | null) => void;
  setError: (error: string | null) => void;
  fetchRows: () => void;
}

export default function EditPanel({
  editingSlug,
  editingProfile,
  editingStatus,
  editingLastFetched,
  clubs,
  linkedProfileIds,
  actionLoading,
  setEditingSlug,
  setEditingProfile,
  setEditingStatus,
  setEditingLastFetched,
  setActionLoading,
  setError,
  fetchRows,
}: EditPanelProps) {
  function closePanel() {
    setEditingSlug(null);
    setEditingProfile(null);
    setEditingStatus(null);
    setEditingLastFetched(null);
  }

  async function handleSave() {
    setActionLoading(editingSlug);
    try {
      const updateBody: Record<string, unknown> = {
        profile_id: editingProfile,
        status: editingStatus,
        last_fetched:
          editingLastFetched === "" || editingLastFetched === null
            ? null
            : new Date(editingLastFetched).toISOString(),
      };
      const res = await fetch("/api/admin/clubs/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagram_slug: editingSlug, ...updateBody }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      closePanel();
      fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Editing: <span className="font-mono">{editingSlug}</span>
        </h3>
        <button
          onClick={closePanel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">
            Linked Profile
          </label>
          <ClubPickerDropdown
            value={editingProfile ?? ""}
            onChange={(id) => setEditingProfile(id || null)}
            clubs={clubs}
            linkedProfileIds={linkedProfileIds}
          />
        </div>

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
                    } ${STATUS_CONFIG[editingStatus]?.text ?? "text-gray-600"}`}
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
          onClick={closePanel}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <Button
          onClick={handleSave}
          disabled={actionLoading === editingSlug}
          className="gap-1.5 bg-muted/10 hover:bg-muted/25 text-black"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

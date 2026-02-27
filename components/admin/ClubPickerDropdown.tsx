"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AdminClub } from "@/lib/admin/types";

function ClubOption({ club }: { club: AdminClub }) {
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
      <span className="truncate">{club.first_name}</span>
    </span>
  );
}

interface ClubPickerDropdownProps {
  value: string;
  onChange: (id: string) => void;
  clubs: AdminClub[];
  linkedProfileIds: Set<string>;
  disabled?: boolean;
}

export default function ClubPickerDropdown({
  value,
  onChange,
  clubs,
  linkedProfileIds,
  disabled,
}: ClubPickerDropdownProps) {
  const [search, setSearch] = useState("");
  const selectedClub = clubs.find((c) => c.id === value);

  const filtered = clubs.filter((c) =>
    c.first_name.toLowerCase().includes(search.toLowerCase()),
  );
  const available = filtered.filter((c) => !linkedProfileIds.has(c.id));
  const alreadyLinked = filtered.filter((c) => linkedProfileIds.has(c.id));

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setSearch("");
      }}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none"
        >
          {selectedClub ? (
            <ClubOption club={selectedClub} />
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
          />
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
        </div>

        <div className="scrollbar-hide max-h-52 overflow-y-auto py-1">
          <DropdownMenuItem
            onClick={() => onChange("")}
            className={!value ? "font-semibold" : ""}
          >
            <span className="text-gray-400">None</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />

          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              No clubs found
            </div>
          ) : (
            <>
              {available.map((club) => (
                <DropdownMenuItem
                  key={club.id}
                  onClick={() => onChange(club.id)}
                  className={value === club.id ? "font-semibold" : ""}
                >
                  <ClubOption club={club} />
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
                      onClick={() => onChange(club.id)}
                      className="opacity-50"
                    >
                      <ClubOption club={club} />
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {value && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

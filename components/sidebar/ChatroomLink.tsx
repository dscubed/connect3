"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2 } from "lucide-react";

interface ChatroomLinkProps {
  title: string;
  href: string;
  isActive?: boolean;
  onRename?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function ChatroomLink({
  title,
  href,
  isActive = false,
  onRename,
  onDelete,
  disabled = false,
}: ChatroomLinkProps) {
  return (
    <div
      className={`group relative flex items-center w-full rounded-lg transition-colors duration-150
        ${
          isActive
            ? "bg-violet-100 text-violet-700"
            : "hover:bg-black/[0.04] text-black/70 hover:text-black"
        }
      `}
    >
      <Link
        href={href}
        className="flex-1 min-w-0 px-3 py-2 text-sm font-medium truncate"
      >
        {title}
      </Link>

      {/* Dropdown menu - visible on hover */}
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pr-1"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`p-1.5 rounded-md transition-colors
                ${
                  isActive
                    ? "hover:bg-violet-200 text-violet-600"
                    : "hover:bg-black/10 text-black/50"
                }
              `}
              disabled={disabled}
              aria-label="Chatroom options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="z-[110] w-36 border border-gray-200"
          >
            {onRename && (
              <DropdownMenuItem onClick={onRename} className="cursor-pointer">
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
            )}

            {onDelete && (
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 cursor-pointer"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

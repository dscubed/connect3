"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useChunkContext } from "../../hooks/ChunkProvider";
import { useAuthStore } from "@/stores/authStore";
import {
  AllCategories,
  organisationCategoriesList,
  userCategoriesList,
} from "../../ChunkUtils";

export function CategoryHeaderDropdown({ category }: { category: AllCategories }) {
  const { changeCategory } = useChunkContext();
  const profile = useAuthStore.getState().profile;

  const categoriesList: AllCategories[] =
    profile?.account_type === "organisation"
      ? organisationCategoriesList.filter((c) => c !== "Events")
      : [...userCategoriesList];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="!p-0 !h-auto !bg-transparent !text-base inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity text-left font-medium"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-base">{category}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="max-h-48 overflow-y-auto"
      >
        {categoriesList.map((cat) => (
          <DropdownMenuItem
            key={cat}
            className="text-base"
            onClick={() => changeCategory(category, cat)}
            disabled={cat === category}
          >
            {cat}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

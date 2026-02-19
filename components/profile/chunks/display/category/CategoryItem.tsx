import { SortableCategory } from "./SortableCategory";
import { CategoryChunks } from "./CategoryChunks";
import { CategoryHeaderDropdown } from "./CategoryHeaderDropdown";
import { ChunkEntry } from "../../ChunkUtils";
import { useChunkContext } from "@/components/profile/chunks/hooks/ChunkProvider";
import { AllCategories } from "../../ChunkUtils";
import {
  SectionCard,
  SectionCardHeader,
} from "@/components/profile/SectionCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useProfileContext } from "@/components/profile/ProfileProvider";
import ClubEventsCard from "@/components/profile/events/ClubEventsCard";
import EventFormHeader from "@/components/profile/events/EventFormHeader";

interface CategoryItemProps {
  category: AllCategories;
  chunks: ChunkEntry[];
}

export function CategoryItem({ category, chunks }: CategoryItemProps) {
  const {
    isEditing,
    isEditingCategory,
    saveEdits,
    cancelEdits,
    focusedChunkId,
    focusDiv,
    cancelDivFocus,
    focusedDiv,
  } = useChunkContext();
  const { profile, isOwnProfile } = useProfileContext();
  const isEventsCategory = category === "Events";
  const canManageEvents =
    isOwnProfile && profile.account_type === "organisation";
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !focusedChunkId[category] &&
        focusedDiv === category
      ) {
        cancelDivFocus(category);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedChunkId, focusedDiv, category, cancelDivFocus]);

  return (
    <SortableCategory key={category} id={category}>
      {({ attributes, listeners, setNodeRef, style }) => (
        <SectionCard
          className="flex flex-col items-start align-start w-full"
          style={style}
          ref={setNodeRef}
          onClick={() => focusDiv(category)}
          variant="white"
        >
          {/* Category Header */}
          <SectionCardHeader
            title={
              !isEventsCategory && isEditing ? (
                <CategoryHeaderDropdown category={category} />
              ) : (
                category
              )
            }
            dragHandleProps={
              isEditing ? { ...attributes, ...listeners } : undefined
            }
          >
            {isEventsCategory && canManageEvents ? (
              <EventFormHeader variant="compact" />
            ) : null}
          </SectionCardHeader>
          <CardContent className="w-full flex flex-col gap-4 !p-4 !pt-0">
            {isEventsCategory ? (
              <ClubEventsCard
                profileId={profile.id}
              />
            ) : (
              <>
                {/* Category Chunks */}
                <CategoryChunks chunks={chunks} category={category} />
                {isEditingCategory(category) && (
                  <div className="w-full flex flex-row justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => saveEdits(category)}
                      className={cn(
                        "rounded-full bg-purple-500 px-4 py-1.5 text-white hover:bg-purple-600 hover:text-white"
                      )}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => cancelEdits(category)}
                      className={cn(
                        "rounded-full bg-gray-200 px-4 py-1.5 text-muted hover:bg-gray-300 hover:text-card-foreground"
                      )}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </SectionCard>
      )}
    </SortableCategory>
  );
}

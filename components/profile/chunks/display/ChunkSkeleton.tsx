import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard, SectionCardHeader } from "@/components/profile/SectionCard";
import { CardContent } from "@/components/ui/card";

/**
 * Skeleton for a single chunk card - matches CategoryItem layout.
 * Light card with oval placeholder (category) and 3 text line placeholders.
 */
export function ChunkSkeleton() {
  return (
    <SectionCard
      className="flex flex-col items-start justify-center w-full shadow-none"
      variant="white"
    >
      <SectionCardHeader
        title={<Skeleton className="h-6 w-28 rounded-2xl" />}
        className="w-full flex flex-row items-center justify-between gap-2 !px-4 !pt-4 !pb-3 !space-y-0"
      />
      <CardContent className="w-full !p-4 !pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </SectionCard>
  );
}

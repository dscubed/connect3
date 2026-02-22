import { Skeleton } from "@/components/ui/skeleton";
import { ChunkSkeleton } from "./chunks/display/ChunkSkeleton";

export function ProfilePageSkeleton() {
  return (
    <div className="w-full max-w-screen-lg mx-auto min-h-full p-0 pb-8 md:p-4 md:pb-8">
      {/* Cover + Avatar overlay */}
      <div className="relative">
        <Skeleton className="h-48 w-full shrink-0 rounded-none md:rounded-xl" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 flex items-end justify-between">
            <div className="translate-y-1/2">
              <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white" />
            </div>
            <div className="translate-y-1/2">
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-24">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col gap-5">
            <div className="flex-1">
              {/* Name */}
              <div className="flex flex-col gap-2 mb-2">
                <Skeleton className="h-8 w-48" />
                {/* University row + links inline */}
                <div className="flex flex-row flex-wrap items-center justify-between gap-3 min-h-10">
                  <Skeleton className="h-6 w-36" />
                  <div className="flex items-center gap-2 h-9">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <ChunkSkeleton />
        </div>
      </div>
    </div>
  );
}

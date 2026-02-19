import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard, SectionCardHeader } from "./SectionCard";
import { CardContent } from "@/components/ui/card";

export function ProfilePageSkeleton() {
  return (
    <div
      className="h-[100dvh] w-full max-w-screen-lg mx-auto overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.3) transparent",
      }}
    >
      {/* Cover + Avatar overlay */}
      <div className="relative">
        <Skeleton className="h-48 w-full shrink-0 rounded-xl" />
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
            {/* UserDetails: name + university */}
            <div className="flex flex-col gap-2 mb-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-36" />
            </div>
            {/* LinksSection */}
            <div className="flex items-center gap-4 h-9">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <SectionCard className="mb-8 flex flex-col items-start justify-center w-full shadow-none bg-card/50 border-foreground/30">
          <SectionCardHeader
            title={<Skeleton className="h-6 w-24 rounded-2xl inline-block" />}
            className="w-full flex flex-row items-center justify-between gap-2 !px-4 !pt-4 !pb-3 !space-y-0"
          />
          <CardContent className="w-full flex flex-col gap-4 !p-4 !pt-0">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
          </CardContent>
        </SectionCard>

        {/* Chunks Section */}
        <div className="w-full flex flex-col gap-6 mb-24">
          {[1, 2, 3].map((i) => (
            <SectionCard
              key={i}
              className="flex flex-col items-start justify-center w-full shadow-none bg-card/50 border-foreground/30"
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
          ))}
        </div>
      </div>
    </div>
  );
}

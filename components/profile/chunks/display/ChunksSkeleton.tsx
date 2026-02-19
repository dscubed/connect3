import { ChunkSkeleton } from "./ChunkSkeleton";

export function ChunksSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 mb-24">
      {[1, 2, 3].map((i) => (
        <ChunkSkeleton key={i} />
      ))}
    </div>
  );
}

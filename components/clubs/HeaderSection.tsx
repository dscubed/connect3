export function ClubsHeader({
  clubCount,
  isLoading,
}: {
  clubCount: number;
  isLoading?: boolean;
}) {
  return (
    <div className="pl-20 sm:ml-0 border-b border-white/10 p-4 sm:p-6 lg:p-7 flex-shrink-0">
      <div className="flex items-center gap-3 mb-2 sm:mb-3">
        {/* Icon - hidden on mobile, shown on desktop */}
        <h1 className="text-xl sm:text-2xl font-bold">Clubs and Societies</h1>
      </div>
      <p className="text-muted text-xs sm:text-sm font-medium">
        {clubCount} clubs affiliated with connect3
        {isLoading && " (loading more...)"}
      </p>
    </div>
  );
}

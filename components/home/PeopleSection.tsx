import React from "react";
import ProfileCard, { Profile } from "@/components/home/ProfileCard";
import { ArrowDown, RefreshCw } from "lucide-react";
import { CubeLoader } from "@/components/ui/CubeLoader";

export interface PeopleSectionProps {
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

// Header component to avoid repetition
const SectionHeader = () => (
  <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight px-10 flex items-center gap-2">
    <span>suggested profiles</span>
    <ArrowDown strokeWidth={4} />
  </h2>
);

// Loading state component
const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-4">
      <CubeLoader size={48} />
      <p className="text-white/60">loading suggested profiles...</p>
    </div>
  </div>
);

// Error state component
const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-red-400 text-lg">😕</div>
      <p className="text-red-400">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="col-span-full text-center text-white/60 py-12">
    <div className="flex flex-col items-center gap-4">
      <div className="text-4xl">👋</div>
      <p className="text-lg">no suggested profiles yet...</p>
      <p className="text-sm">check back soon for new members!</p>
    </div>
  </div>
);

const PeopleSection: React.FC<PeopleSectionProps> = ({
  profiles,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <div className="mt-12">
      <SectionHeader />

      {isLoading && <LoadingState />}

      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!isLoading && !error && (
        <div className="px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile: Profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
            {profiles.length === 0 && <EmptyState />}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleSection;

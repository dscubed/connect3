import { Users, Building2, Search } from "lucide-react";

interface EntityTypeIndicatorProps {
  entityTypes?: {
    users: boolean;
    organisations: boolean;
  };
}

export const EntityTypeIndicator = ({ entityTypes }: EntityTypeIndicatorProps) => {
  if (!entityTypes) return null;

  const searchingBoth = entityTypes.users && entityTypes.organisations;
  const searchingUsers = entityTypes.users && !entityTypes.organisations;
  const searchingOrgs = !entityTypes.users && entityTypes.organisations;

  return (
    <div className="flex items-center gap-2 text-sm text-white/60">
      <Search className="h-4 w-4" />
      <div className="flex items-center gap-2">
        {searchingUsers && (
          <>
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span>People</span>
          </>
        )}
        {searchingBoth && (
          <span className="text-white/40">•</span>
        )}
        {searchingOrgs && (
          <>
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <span>Organizations</span>
          </>
        )}
      </div>
    </div>
  );
};

import { Users, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityTypeBadgeProps {
  entityTypes?: {
    users: boolean;
    organisations: boolean;
  };
  className?: string;
}

export const EntityTypeBadge = ({ entityTypes, className }: EntityTypeBadgeProps) => {
  if (!entityTypes) return null;

  const searchingBoth = entityTypes.users && entityTypes.organisations;
  const searchingUsers = entityTypes.users && !entityTypes.organisations;
  const searchingOrgs = !entityTypes.users && entityTypes.organisations;

  if (!searchingBoth && !searchingUsers && !searchingOrgs) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm",
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
      
      {searchingBoth && (
        <>
          <Users className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">People</span>
          <span className="text-xs text-muted-foreground">&</span>
          <Building2 className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Clubs</span>
        </>
      )}
      
      {searchingUsers && (
        <>
          <Users className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">People</span>
        </>
      )}
      
      {searchingOrgs && (
        <>
          <Building2 className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Clubs</span>
        </>
      )}
    </div>
  );
};

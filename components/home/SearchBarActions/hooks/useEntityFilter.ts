import { useCallback, useState } from "react";

// Entity filter options for dropdown
export interface EntityFilterOptions {
  events: boolean;
  organisations: boolean;
  users: boolean;
}

export function useEntityFilter() {
  const [selectedEntityFilters, setSelectedEntityFilters] =
    useState<EntityFilterOptions>({
      users: true,
      organisations: true,
      events: true,
    });

  const handleEntityFilterClick = useCallback(
    (selectedFilter: keyof EntityFilterOptions) => {
      setSelectedEntityFilters((prevFilters) => {
        // Check inside the setter to get the current state
        const selectedCount = Object.values(prevFilters).filter(Boolean).length;

        // If only 1 selected and trying to unselect it, don't allow
        if (selectedCount === 1 && prevFilters[selectedFilter]) {
          return prevFilters;
        }

        return {
          ...prevFilters,
          [selectedFilter]: !prevFilters[selectedFilter],
        };
      });
    },
    []
  );

  const selectedCount = Object.values(selectedEntityFilters).filter(
    Boolean
  ).length;

  return {
    selectedEntityFilters,
    handleEntityFilterClick,
    selectedCount,
  };
}

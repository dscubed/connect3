import { useState } from "react";
import { useChunksManager } from "./useChunksManager";

export function useCategoriesHandler(userId: string) {
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const { groupedChunks } = useChunksManager(userId);

  // Set categories and expand all by default
  const updateCategories = () => {
    setCategories(Object.keys(groupedChunks));
    setExpandedCategories(new Set(Object.keys(groupedChunks)));
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return newExpanded;
    });
  };

  // Expand all categories
  const expandAllCategories = () => {
    setExpandedCategories(new Set(categories));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  return {
    categories,
    setCategories: updateCategories,
    expandedCategories,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    updateCategories,
  };
}

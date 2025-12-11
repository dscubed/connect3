import { useState } from "react";
import { SearchBarUI } from "../home/SearchBarUI";
import { EntityFilterOptions } from "../home/hooks/useSearch";

interface ChatRoomSearchBarProps {
  chatroomId: string | null;
  addNewMessage: (
    query: string,
    selectedEntityFilters: EntityFilterOptions
  ) => void;
}

interface ChatRoomSearchBarProps {
  chatroomId: string | null;
  addNewMessage: (
    query: string,
    selectedEntityFilters: EntityFilterOptions
  ) => void;
  inFlight?: boolean;
}

export function ChatRoomSearchBar({
  chatroomId,
  addNewMessage,
  inFlight = false,
}: ChatRoomSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (
    query: string,
    selectedEntityFilters: EntityFilterOptions
  ) => {
    if (query.trim() === "" || inFlight) return;
    setQuery("");
    addNewMessage(query, selectedEntityFilters);
  };

  if (!chatroomId) return null;

  return (
    <SearchBarUI
      query={query}
      setQuery={setQuery}
      disabled={inFlight}
      isLoading={inFlight}
      onSubmit={handleSubmit}
    />
  );
}

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

export function ChatRoomSearchBar({
  chatroomId,
  addNewMessage,
}: ChatRoomSearchBarProps) {
  const [query, setQuery] = useState("");
  const [addingMessage, setAddingMessage] = useState(false);

  const handleSubmit = async (
    query: string,
    selectedEntityFilters: EntityFilterOptions
  ) => {
    if (query.trim() === "") return;
    setAddingMessage(true);
    setQuery("");
    addNewMessage(query, selectedEntityFilters);
    setAddingMessage(false);
  };

  if (!chatroomId) return null;

  return (
    <SearchBarUI
      query={query}
      setQuery={setQuery}
      disabled={addingMessage}
      onSubmit={handleSubmit}
    />
  );
}

import { useState } from "react";
import { SearchBarUI } from "../home/SearchBarUI";

interface ChatRoomSearchBarProps {
  chatroomId: string | null;
  addNewMessage: (query: string) => void;
}

interface ChatRoomSearchBarProps {
  chatroomId: string | null;
  addNewMessage: (query: string) => void;
  inFlight?: boolean;
}

export function ChatRoomSearchBar({
  chatroomId,
  addNewMessage,
  inFlight = false,
}: ChatRoomSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (submittedQuery: string) => {
    if (submittedQuery.trim() === "" || inFlight) return;
    setQuery(""); // Clear immediately after submission
    addNewMessage(submittedQuery);
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

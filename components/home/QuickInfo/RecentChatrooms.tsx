import { useRouter } from "next/navigation";
import { useRecentChats } from "../hooks/useRecentChats";
import { formatTime } from "../hooks/QuickInfoUtils";

export default function RecentChatrooms({ userId }: { userId: string | null }) {
  const router = useRouter();
  const { chatrooms, loading } = useRecentChats();

  if (!userId) {
    return <span className="text-xs text-white/30">Not logged in</span>;
  }

  if (loading) {
    return <span className="text-xs text-white/30">Loading...</span>;
  }

  if (chatrooms.length === 0) {
    return <span className="text-xs text-white/30">No recent chats</span>;
  }

  return chatrooms.map((chat) => (
    <div
      key={chat.id}
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
      onClick={() => router.push(`/search?chatroom=${chat.id}`)}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-white/90 truncate">
          {chat.title}
        </span>
        <span className="text-xs text-white/40 truncate">
          Last Query: {chat.last_query}
        </span>
      </div>
      <span className="text-xs text-white/50 whitespace-nowrap">
        {chat.last_message_at ? formatTime(chat.last_message_at) : ""}
      </span>
    </div>
  ));
}

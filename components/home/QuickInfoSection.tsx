import { Clock, Flame, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import RecentChatrooms from "../sidebar/RecentChatrooms";
import MatchStats from "./QuickInfo/MatchStats";

export default function QuickInfoSection() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? null;
  const [activeTab, setActiveTab] = useState("chats");

  const TABS = [
    {
      key: "chats",
      label: "Chats",
      icon: <Clock className="h-4 w-4 text-white/40" />,
      content: <RecentChatrooms userId={userId} guest={user?.is_anonymous} />,
    },
    {
      key: "stats",
      label: "Your Stats",
      icon: <TrendingUp className="h-4 w-4 text-white/40" />,
      content: <MatchStats userId={userId} guest={user?.is_anonymous} />,
    },
    {
      key: "trending",
      label: "Trending",
      icon: <Flame className="h-4 w-4 text-white/40" />,
      content: (
        <div className="text-white/60 text-sm px-2 py-4">
          More content coming soon!
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 w-full h-full flex flex-col justify-end">
      {" "}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 backdrop-blur-sm">
        {/* Tab Buttons */}
        <div className="flex items-center gap-3 mb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 text-xs uppercase tracking-wider px-3 py-1 rounded transition
                ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white/90 font-semibold"
                    : "text-white/40 hover:bg-white/5"
                }`}
            >
              {tab.icon}
              <span className="sm:block hidden">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="h-0.5 bg-white/5 mb-4 rounded-full w-full" />

        {/* Tab Content */}
        <div className="space-y-2 mb-1">
          {TABS.find((tab) => tab.key === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}

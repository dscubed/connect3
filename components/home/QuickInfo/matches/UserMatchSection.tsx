import { MatchedUsersDetails, FilterType } from "./types";
import MatchPanel from "./MatchPanel";

export default function UserMatchSection({
  matchedYouUsers,
  youMatchedUsers,
  filter,
  activeSection,
  setActiveSection,
}: {
  matchedYouUsers: MatchedUsersDetails | null;
  youMatchedUsers: MatchedUsersDetails | null;
  filter: FilterType;
  activeSection: "matchedYou" | "youMatched";
  setActiveSection: (section: "matchedYou" | "youMatched") => void;
}) {
  return (
    <div className="bg-white/5 rounded-md p-2 mb-2 flex flex-col sm:flex-row items-center justify-between">
      {/* Mobile: show only active tab as tabs */}
      <div className="w-full sm:hidden">
        <div className="flex mb-3 justify-center gap-2">
          <button
            className={`px-2 py-1 rounded text-xs ${
              activeSection === "matchedYou"
                ? "bg-white/10 text-white"
                : "text-white/40"
            }`}
            onClick={() => setActiveSection("matchedYou")}
          >
            Matched You
          </button>
          <button
            className={`px-2 py-1 rounded text-xs ${
              activeSection === "youMatched"
                ? "bg-white/10 text-white"
                : "text-white/40"
            }`}
            onClick={() => setActiveSection("youMatched")}
          >
            You Matched
          </button>
        </div>
        <MatchPanel
          matchedUsersDetails={
            activeSection === "matchedYou" ? matchedYouUsers : youMatchedUsers
          }
          type={activeSection}
          blurAvatars={activeSection === "matchedYou"}
          filter={filter}
        />
      </div>
      {/* Desktop: show both sections with divider */}
      <div className="hidden sm:flex flex-row w-full items-stretch justify-start">
        <div className="flex-1 flex justify-center">
          <MatchPanel
            matchedUsersDetails={matchedYouUsers}
            type="matchedYou"
            blurAvatars={true}
            filter={filter}
          />
        </div>
        <div className="flex items-center self-stretch">
          <div className="h-20 border-l border-white/10 mx-4" />
        </div>
        <div className="flex-1 flex justify-center">
          <MatchPanel
            matchedUsersDetails={youMatchedUsers}
            type="youMatched"
            blurAvatars={false}
            filter={filter}
          />
        </div>
      </div>
    </div>
  );
}

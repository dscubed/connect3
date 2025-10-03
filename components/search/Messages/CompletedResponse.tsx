import { motion } from "framer-motion";
import { SearchResults } from "../types";
import { UserProfile } from "../types";
import MatchResults from "../MatchResult/MatchResults";
import PeopleList from "../PeopleList/PeopleList";

export function CompletedResponse({
  content,
  onUserClick,
}: {
  content: SearchResults;
  userProfiles: Map<string, UserProfile>;
  profilesLoading: boolean;
  onUserClick?: (user: UserProfile) => void;
}) {
  return (
    <motion.div
      className="space-y-6 text-white/80 leading-relaxed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Result */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {content.result}
      </motion.p>

      {/* User matches */}
      {(content.matches || []).map((match, userIndex) => {
        return (
          <MatchResults
            key={`user-${userIndex}`}
            match={match}
            userIndex={userIndex}
          />
        );
      })}

      {/* Follow-up questions */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        {content.followUps}
      </motion.p>

      {/* People section */}
      <PeopleList
        isVisible={content.matches && content.matches.length > 0}
        searchMatches={content.matches}
        onUserClick={onUserClick || (() => {})}
      />
    </motion.div>
  );
}

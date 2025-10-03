import { motion } from "framer-motion";
import { DemoQuery, MappedMatchDetails } from "../types";
import DemoMatchResult from "./MatchResult/DemoMatchResult";
import DemoPeopleList from "./PeopleList/DemoPeopleList";
import { demoUsers } from "../sample-data/DemoUsers";

export default function DemoCompletedResponse({ query }: { query: DemoQuery }) {
  const { response } = query;

  // Map user IDs to full user data
  if (!response.matches) {
    return null;
  }
  const mappedMatches: MappedMatchDetails[] = response.matches.map((match) => {
    const userData = demoUsers[match.user_id as keyof typeof demoUsers];

    return {
      user_id: match.user_id,
      full_name: userData?.full_name || "Unknown User",
      avatar_url: userData?.avatar_url || "",
      files: match.files,
    };
  });

  return (
    <motion.div
      className="space-y-6 text-white/80 leading-relaxed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Result */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {response.result}
      </motion.p>

      {/* User matches - Pass mapped data */}
      {mappedMatches.map((match, userIndex) => (
        <DemoMatchResult
          key={match.user_id}
          match={match}
          userIndex={userIndex}
        />
      ))}

      {/* Follow-up questions */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        {response.followUps}
      </motion.p>

      {/* Demo People List - Pass mapped data */}
      <DemoPeopleList matches={mappedMatches} />
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { MappedMatchDetails } from "../types";
import { ProfileCard } from "@/components/search/PeopleList/ProfileCard";
import { demoUsers, UserDetails } from "../sample-data/DemoUsers";

export default function DemoPeopleList({
  matches,
}: {
  matches: MappedMatchDetails[];
}) {
  if (!matches || matches.length === 0) return null;

  const users = matches.map((match) => demoUsers[match.user_id] as UserDetails);
  const profiles = matches.map((match, index) => ({
    id: match.user_id,
    name: users[index]?.name || match.user_id,
    status: users[index]?.status || "Unknown",
    location: users[index]?.location || "Unknown",
    avatar: users[index]?.avatar || "",
  }));

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.4 }}
    >
      <div className="mb-6">
        <p className="text-white/60 text-sm">
          {matches.length} {matches.length === 1 ? "person" : "people"} found
          with relevant content
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
        {matches.map((match, index) => (
          <div key={match.user_id} className="flex-shrink-0 w-80">
            <ProfileCard
              profile={profiles[index]}
              index={index}
              onClick={() => {}}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import DemoProfileCard from "./DemoProfileCard";
import { MappedMatchDetails } from "../types";

export default function DemoPeopleList({
  matches,
}: {
  matches: MappedMatchDetails[];
}) {
  if (!matches || matches.length === 0) return null;

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
            <DemoProfileCard match={match} index={index} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

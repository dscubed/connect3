import { motion } from "framer-motion";
import { SearchResponse } from "@/lib/search/types";
import { ResultSection } from "./QueryResult";

export function CompletedResponse({
  content,
}: {
  content: Partial<SearchResponse>;
}) {
  return (
    <motion.div
      className="space-y-6 leading-relaxed !mt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Result */}
      {content.summary && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {content.summary}
        </motion.p>
      )}

      {/* Results */}
      {(content.results || []).map((result, userIndex) => {
        return <ResultSection key={userIndex} result={result} />;
      })}

      {/* Follow-up questions */}
      {content.followUps && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {content.followUps}
        </motion.p>
      )}
    </motion.div>
  );
}

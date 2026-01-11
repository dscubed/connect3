import { motion } from "framer-motion";
import { SearchResponse } from "@/lib/search/types";
import { ResultSection } from "./QueryResult";
import ReactMarkdown from "react-markdown";

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
        <motion.div
          className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-li:my-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ReactMarkdown>{content.summary}</ReactMarkdown>
        </motion.div>
      )}

      {/* Results */}
      {(content.results || []).map((result, userIndex) => {
        return <ResultSection key={userIndex} result={result} />;
      })}

      {/* Follow-up questions */}
      {content.followUps && (
        <motion.div
          className="prose prose-neutral max-w-none prose-p:leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <ReactMarkdown>{content.followUps}</ReactMarkdown>
        </motion.div>
      )}
    </motion.div>
  );
}

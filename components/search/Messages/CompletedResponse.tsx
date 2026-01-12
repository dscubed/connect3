import { motion } from "framer-motion";
import { SearchResponse } from "@/lib/search/types";
import { ResultSection } from "./QueryResult";
import { QuickLinks } from "@/components/search/Messages/quickLinks";
import { Markdown } from "@/components/search/Messages/markdown";
import { extractLinksFromMarkdown } from "@/lib/search/general/extractLinks";

export function CompletedResponse({
  content,
}: {
  content: Partial<SearchResponse>;
}) {
  const links = [
    ...(content.summary ? extractLinksFromMarkdown(content.summary, "summary") : []),
    ...(content.followUps ? extractLinksFromMarkdown(content.followUps, "followUps") : []),
    ...((content.results || []).flatMap((r) =>
      r?.text ? extractLinksFromMarkdown(r.text, "result") : []
    )),
  ];
  return (
    <motion.div
      className="space-y-6 leading-relaxed !mt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <QuickLinks links={links} />
      {/* Result */}
      {content.summary && (
        <motion.div
          className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-li:my-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Markdown>{content.summary}</Markdown>
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
          <Markdown>{content.followUps}</Markdown>
        </motion.div>
      )}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { SearchResponse } from "@/lib/search/types";
import { ResultSection } from "./QueryResult";
import { QuickLinks } from "@/components/search/Messages/quickLinks";
import { Markdown } from "@/components/search/Messages/markdown";
import { extractLinksFromMarkdown } from "@/lib/search/general/extractLinks";
import type { ExtractedLink } from "@/lib/search/general/extractLinks";

export function CompletedResponse({
  content,
}: {
  content: Partial<SearchResponse>;
}) {
  // Prefer structured links if present (no need for the LLM to print them in the summary)
  const structuredLinks: ExtractedLink[] =
    (content.quickLinks ?? []).map((l) => ({
      url: l.url,
      label: l.label,
      source: "summary", // maps into your ExtractedLink union; UI doesn’t care
    })) ?? [];

  // Fallback: extract from markdown
  const extractedLinks: ExtractedLink[] = [
    ...(content.summary ? extractLinksFromMarkdown(content.summary, "summary") : []),
    ...(content.followUps ? extractLinksFromMarkdown(content.followUps, "followUps") : []),
    ...((content.results || []).flatMap((r) =>
      r?.text ? extractLinksFromMarkdown(r.text, "result") : []
    )),
  ];

  const links = structuredLinks.length ? structuredLinks : extractedLinks;

  return (
    <motion.div
      className="space-y-6 leading-relaxed !mt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <QuickLinks links={links} />

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

      {(content.results || []).map((result, userIndex) => {
        return <ResultSection key={userIndex} result={result} />;
      })}

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
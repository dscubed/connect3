import { motion } from "framer-motion";
import { SearchResponse } from "@/lib/search/types";
import { QuickLinks } from "@/components/search/Messages/quickLinks";
import { Markdown } from "@/components/search/Messages/markdown";
import { extractLinksFromMarkdown } from "@/lib/search/general/extractLinks";
import type { ExtractedLink } from "@/lib/search/general/extractLinks";
import {
  splitMarkdownIntoSegments,
  normalizeToMarkdownResponse,
} from "@/lib/search/markdownParser";
import MatchResults from "../MatchResult/MatchResults";

export function CompletedResponse({
  content,
}: {
  content: Partial<SearchResponse> | unknown;
}) {
  // Normalize content to the new markdown format (handles legacy format too)
  const normalized = normalizeToMarkdownResponse(content);

  // Extract links from markdown
  const structuredLinks: ExtractedLink[] =
    (normalized.quickLinks ?? []).map((l) => ({
      url: l.url,
      label: l.label,
      source: "summary",
    })) ?? [];

  const extractedLinks: ExtractedLink[] = normalized.markdown
    ? extractLinksFromMarkdown(normalized.markdown, "summary")
    : [];

  const links = structuredLinks.length ? structuredLinks : extractedLinks;

  // Split markdown into text segments and entity markers
  const segments = splitMarkdownIntoSegments(normalized.markdown);

  return (
    <motion.div
      className="space-y-4 leading-relaxed !mt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <QuickLinks links={links} />

      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <motion.div
              key={`text-${index}`}
              className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-li:my-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * Math.min(index, 5) }}
            >
              <Markdown>{segment.content}</Markdown>
            </motion.div>
          );
        }

        // Entity marker - render as a card
        return (
          <MatchResults
            key={`entity-${segment.entity.type}-${segment.entity.id}`}
            match={segment.entity}
            userIndex={index}
          />
        );
      })}
    </motion.div>
  );
}

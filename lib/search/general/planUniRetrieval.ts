export type UniRetrievalPlan = {
  intent: "NARROW" | "BROAD" | "RESOURCE";
  includeOverviews: boolean;
  preferLinks: boolean;
  maxNumResults: number; // file_search max_num_results
  chunkTypes: ("section" | "page_overview")[];
  reason: string;
};

function hasAny(q: string, words: string[]) {
  return words.some((w) => q.includes(w));
}

export function planUniRetrieval(query: string): UniRetrievalPlan {
  const q = query.toLowerCase();

  const resourceSignals = [
    "link",
    "links",
    "website",
    "url",
    "resources",
    "where can i find",
    "where do i find",
    "official page",
    "contact",
    "email",
    "phone",
    "form",
    "apply",
    "application",
  ];

  const broadSignals = [
    "overview",
    "everything",
    "all",
    "options",
    "services",
    "support services",
    "what help",
    "what can i do",
    "what are my options",
    "how does it work",
    "explain",
    "guide",
  ];

  const isResource = hasAny(q, resourceSignals);
  const isBroad = hasAny(q, broadSignals);

  const intent: UniRetrievalPlan["intent"] = isResource
    ? "RESOURCE"
    : isBroad
    ? "BROAD"
    : "NARROW";

  const includeOverviews = intent !== "NARROW"; // BROAD/RESOURCE benefit from overview chunks
  const preferLinks = intent !== "NARROW" || isResource;

  const maxNumResults =
    intent === "NARROW" ? 4 : intent === "BROAD" ? 6 : 8;

  const chunkTypes: UniRetrievalPlan["chunkTypes"] = includeOverviews
    ? ["section", "page_overview"]
    : ["section"];

  return {
    intent,
    includeOverviews,
    preferLinks,
    maxNumResults,
    chunkTypes,
    reason: `heuristic intent=${intent}`,
  };
}
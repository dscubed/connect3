export type SiteConfig = {
  siteId: string;            // "umsu" | "unimelb-dates"
  baseUrl: string;           // origin
  seeds: string[];           // starting URLs
  allowPrefixes: string[];   // only crawl these paths
  denySubstrings: string[];  // skip if URL contains these
  maxPages: number;
  delayMs: number;           // politeness delay
};

export const SITES: SiteConfig[] = [
  {
    siteId: "umsu",
    baseUrl: "https://umsu.unimelb.edu.au",
    seeds: ["https://umsu.unimelb.edu.au/"],
    allowPrefixes: [
      "https://umsu.unimelb.edu.au/",
    ],
    denySubstrings: [
      "/wp-admin",
      "/search",
      "#",
      "mailto:",
      "tel:",
    ],
    maxPages: 200,
    delayMs: 800,
  },
];

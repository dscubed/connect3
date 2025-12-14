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
        seeds: [
          "https://umsu.unimelb.edu.au/",
          "https://umsu.unimelb.edu.au/about/",
          "https://umsu.unimelb.edu.au/services/",
          "https://umsu.unimelb.edu.au/support/",
          "https://umsu.unimelb.edu.au/clubs/",
        ],
        allowPrefixes: [
          "https://umsu.unimelb.edu.au/",
        ],
        denySubstrings: [
          "/photos/",
          "/advertclick/",
          "/login/",
          "/pagestylesheet/",
          "/stylesheet/",
          "/skins/",
          "/resourcehandler/",
          "/edit/",
          "/search/",
          "/asset/",
          "/account/",
          "/Shibboleth.sso",
          "/sso/",
          "mailto:",
          "tel:",
          "#",
        ],
        maxPages: 150,
        delayMs: 800, // polite crawl
      }      
];

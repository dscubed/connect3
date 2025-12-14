export type SiteConfig = {
    siteId: string;
    baseUrl: string;
    seeds: string[];
    allowPrefixes: string[];
    denySubstrings: string[];
    maxPages: number;
    delayMs: number;
  };
  
  export const SITES: SiteConfig[] = [
    {
      siteId: "umsu",
      baseUrl: "https://umsu.unimelb.edu.au",
  
      // “Soft sitemap” seeds (you provided these)
      seeds: [
        "https://umsu.unimelb.edu.au/support/",
        "https://umsu.unimelb.edu.au/buddy-up/",
        "https://umsu.unimelb.edu.au/buddy-up/clubs/",
        "https://umsu.unimelb.edu.au/express-yourself/",
        "https://umsu.unimelb.edu.au/about/",
      ],
  
      // Restrict crawl strictly to these sections (and their children)
      allowPrefixes: [
        "https://umsu.unimelb.edu.au/support/",
        "https://umsu.unimelb.edu.au/buddy-up/",
        "https://umsu.unimelb.edu.au/express-yourself/",
        "https://umsu.unimelb.edu.au/about/",
      ],
  
      // Robots.txt disallows + additional practical exclusions
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
        "javascript:",
        "#",
  
        // Optional: avoid common “spammy” URL patterns
        "?",
      ],
  
      maxPages: 650,  // bump if you want more coverage
      delayMs: 900,   // polite
    },
  ];
  
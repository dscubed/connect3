export type SiteConfig = {
    siteId: string;
    kbSlug?: string;
    baseUrl: string;
    seeds: string[];
    allowPrefixes: string[];
    denySubstrings: string[];
    maxPages: number;
    delayMs: number;
  };
  
  export const SITES: SiteConfig[] = [
    // ---------------------------
    // 0) UMSU (University of Melbourne Student Union)
    // robots.txt disallows /admin/, /login/, /pagestylesheet/, /stylesheet/, /skins/, /resourcehandler/, /edit/, /search/, /asset/, /account/, /Shibboleth.sso, /sso/
    // ---------------------------
    {
      siteId: "umsu",
      kbSlug: "unimelb_su",
      baseUrl: "https://umsu.unimelb.edu.au",

      // Broader seeds to help discovery
      seeds: [
        "https://umsu.unimelb.edu.au/",

        // Keep your original seeds
        "https://umsu.unimelb.edu.au/support/",
        "https://umsu.unimelb.edu.au/buddy-up/",
        "https://umsu.unimelb.edu.au/express-yourself/",
        "https://umsu.unimelb.edu.au/about/",

        // New: major sections on the public site
        "https://umsu.unimelb.edu.au/things-to-do/",
        "https://umsu.unimelb.edu.au/things-to-do/events/",
        "https://umsu.unimelb.edu.au/make-a-difference/",
        "https://umsu.unimelb.edu.au/international/",
        "https://umsu.unimelb.edu.au/oweek/",

        // New: public sitemap as an efficient discovery hub
        "https://umsu.unimelb.edu.au/sitemap/",
      ],

      // Allow crawling across additional public sections
      allowPrefixes: [
        // Keep original scope
        "https://umsu.unimelb.edu.au/support/",
        "https://umsu.unimelb.edu.au/buddy-up/",
        "https://umsu.unimelb.edu.au/express-yourself/",
        "https://umsu.unimelb.edu.au/about/",

        // Expanded scope
        "https://umsu.unimelb.edu.au/things-to-do/",
        "https://umsu.unimelb.edu.au/make-a-difference/",
        "https://umsu.unimelb.edu.au/international/",
        "https://umsu.unimelb.edu.au/oweek/",

        // Optional: allow the sitemap page itself (but not necessarily "everything")
        "https://umsu.unimelb.edu.au/sitemap/",
      ],

      // Keep your practical exclusions + add a couple more
      denySubstrings: [
        // existing
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

        // extra: common non-content/static noise (adjust to your crawler logic)
        ".css",
        ".js",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".svg",
        "/ords/",            // if any oracle/ords surfaces show up
        "/api/",             // if you see api endpoints being discovered
      ],

      maxPages: 8000,     // increased because you widened scope
      delayMs: 650,       // keep polite (or increase to 800–1000 if you hit rate limits)
    },
    /* 
    // ---------------------------
    // 1) Unimelb main site
    // robots disallows: /home-new/, /design/, /staffdev/, /_assets/, /templates*, etc.
    // Sitemap: https://www.unimelb.edu.au/sitemap.xml
    // ---------------------------
    {
      siteId: "unimelb",
      kbSlug: "unimelb_official",
      baseUrl: "https://unimelb.edu.au",
      seeds: [
        "https://unimelb.edu.au/students",
        "https://unimelb.edu.au/students/support",
        "https://unimelb.edu.au/study",
        "https://unimelb.edu.au/study/students",
      ],
      // Keep this conservative; widen later if needed
      allowPrefixes: [
        "https://unimelb.edu.au/students",
        "https://unimelb.edu.au/study",
      ],
      denySubstrings: [
        "/home-new/",
        "/design/",
        "/staffdev/",
        "/_assets/",
        "/templates/",
        "/template-assets/",
        "/template-assets-custom/",
        "/templates-stuff/",
        "/__data/assets/",
        "utm_",
        "?share=",
        "?amp",
        "/search",
        "/global-search",
        "/news",
        "/research",
        "/alumni",
        "/staff",
      ],
      maxPages: 1800,
      delayMs: 650,
    },

    // ---------------------------
    // 2) Monash Student Association (msa.monash.edu) (HubSpot-ish)
    // robots disallows preview / preferences / hs_preview params
    // ---------------------------
    {
      siteId: "msa",
      kbSlug: "monash_su",
      baseUrl: "https://msa.monash.edu",
      seeds: [
        "https://msa.monash.edu",
        "https://msa.monash.edu/clubs",
        "https://msa.monash.edu/advocacy",
        "https://msa.monash.edu/support",
        "https://msa.monash.edu/contact",
      ],
      allowPrefixes: ["https://msa.monash.edu"],
      denySubstrings: [
        "/_hcms/preview/",
        "/hs/manage-preferences/",
        "/hs/preferences-center/",
        "hs_preview=",
        "hsCacheBuster=",
        "utm_",
        "?share=",
        "?amp",
        "/search",
      ],
      maxPages: 1200,
      delayMs: 650,
    },

    // ---------------------------
    // 3) Monash main site (BIG) — note Crawl-Delay: 30
    // robots disallows /search, /global-search, lots of internal paths, and query patterns.
    // ---------------------------
    {
      siteId: "monash",
      kbSlug: "monash_official",
      baseUrl: "https://monash.edu",
      seeds: [
        "https://monash.edu/students",
        "https://monash.edu/study",
        "https://monash.edu/students/support",
        "https://monash.edu/students/admin",
        "https://monash.edu/students/communities",
      ],
      // Strongly recommend staying on students/study.
      allowPrefixes: [
        "https://monash.edu/students",
        "https://monash.edu/study",
      ],
      denySubstrings: [
        "/global-search",
        "/search",
        "/_content",
        "/_designs",
        "/__lib",
        "/__fudge",
        "/_dev",
        "/_webservices",
        "/monash-mango/",
        "/cgi-bin/",
        "/images/",
        "/ftp",
        "/pub/",
        "/wwwdev/",
        "/wwwdev_src/",
        "/old/",
        "/servers/",
        "/stats/",
        "/sso",
        "/timetables-staging",
        "/news/internal/",
        "/study/search",
        "/study/examples",
        "/study/_courses",
        "/study/_designs",
        "/study/study-archive",
        "/get-started-new/",
        // query traps from robots
        "sq_content_src=",
        "_recache",
        "_nocache",
        "_edit",
        "_admin",
        "_login",
        "_performance",
        "query=",
        "f.%7C=",
        "SQ_DESIGN_NAME=",
        "SQ_PAINT_LAYOUT_NAME=",
        "utm_",
        "?share=",
        "?amp",
      ],
      maxPages: 2200,
      delayMs: 30500, // respect Crawl-Delay: 30
    },

    // ---------------------------
    // 4) RMIT main site
    // robots: disallow /search?* and some archived/news; sitemap available.
    // ---------------------------
    {
      siteId: "rmit",
      kbSlug: "rmit_official",
      baseUrl: "https://rmit.edu.au",
      seeds: [
        "https://rmit.edu.au/students",
        "https://rmit.edu.au/students/support-and-facilities",
        "https://rmit.edu.au/students/student-essentials",
        "https://rmit.edu.au/students/my-course",
        "https://rmit.edu.au/students/careers-opportunities",
        "https://rmit.edu.au/students/student-life",
      ],
      allowPrefixes: ["https://rmit.edu.au/students"],
      denySubstrings: [
        "/search?",
        "/archived/programs/",
        "/etc/tags",
        "/news/newsroom/media-releases-and-expert-comments/2017",
        "/news/newsroom/media-releases-and-expert-comments/2016",
        "/news/newsroom/media-releases-and-expert-comments/2015",
        "/news/newsroom/media-releases-and-expert-comments/2014",
        ".feed",
        "utm_",
        "?share=",
        "?amp",
        "/research",
        "/staff",
        "/alumni",
        "/news",
      ],
      maxPages: 1800,
      delayMs: 650,
    },

    // ---------------------------
    // 5) RUSU (RMIT student union)
    // robots: effectively allow all; sitemap_index.xml
    // ---------------------------
    {
      siteId: "rusu",
      kbSlug: "rmit_su",
      baseUrl: "https://rusu.rmit.edu.au",
      seeds: [
        "https://rusu.rmit.edu.au",
        "https://rusu.rmit.edu.au/support",
        "https://rusu.rmit.edu.au/clubs",
        "https://rusu.rmit.edu.au/events",
        "https://rusu.rmit.edu.au/contact",
      ],
      allowPrefixes: ["https://rusu.rmit.edu.au"],
      denySubstrings: [
        "/wp-json/",
        "/tag/",
        "/category/",
        "/author/",
        "/feed/",
        "utm_",
        "?share=",
        "?amp",
        "?p=",
      ],
      maxPages: 1500,
      delayMs: 650,
    },

    // ---------------------------
    // 6) UWA main site (huge)
    // robots disallows: /sitecore, /upload, /Theme, /design-system, etc.
    // Lots of sitemaps listed; we’ll keep to students/study to start.
    // ---------------------------
    {
      siteId: "uwa",
      kbSlug: "uwa_official",
      baseUrl: "https://uwa.edu.au",
      seeds: [
        "https://uwa.edu.au/students",
        "https://uwa.edu.au/students/support",
        "https://uwa.edu.au/students/my-course",
        "https://uwa.edu.au/students/get-involved",
        "https://uwa.edu.au/study",
      ],
      allowPrefixes: [
        "https://uwa.edu.au/students",
        "https://uwa.edu.au/study",
      ],
      denySubstrings: [
        "/xsl/",
        "/Theme/",
        "/upload/",
        "/sitecore",
        "/Sitecore",
        "/App_Data/",
        "/App_config/",
        "/masterbrand/",
        "/App_Browsers/",
        "/design-system/",
        "/sitecore_files/",
        "/sitecore modules/",
        "utm_",
        "?share=",
        "?amp",
        "/search",
        "/news",
        "/research",
        "/alumni",
        "/staff",
      ],
      maxPages: 2000,
      delayMs: 650,
    },

    // ---------------------------
    // 7) UWA Student Guild
    // robots disallows admin/administrator/sitelogin
    // ---------------------------
    {
      siteId: "uwaguild",
      kbSlug: "uwa_su",
      baseUrl: "https://uwastudentguild.com",
      seeds: [
        "https://uwastudentguild.com",
        "https://uwastudentguild.com/clubs",
        "https://uwastudentguild.com/support",
        "https://uwastudentguild.com/contact",
        "https://uwastudentguild.com/events",
      ],
      allowPrefixes: ["https://uwastudentguild.com"],
      denySubstrings: [
        "/admin/",
        "/administrator/",
        "/sitelogin/",
        "utm_",
        "?share=",
        "?amp",
        "/wp-json/",
        "/tag/",
        "/category/",
        "/author/",
        "/feed/",
      ],
      maxPages: 1500,
      delayMs: 650,
    },
    /*
    // ---------------------------
    // 8) Monash Student Association (WordPress)
    // https://monashstudentassociation.com.au
    // robots.txt disallows wp-admin (except admin-ajax)
    // Sitemap: https://monashstudentassociation.com.au/wp-sitemap.xml
    // ---------------------------
    {
      siteId: "msa_wp",
      kbSlug: "monash_su",
      baseUrl: "https://monashstudentassociation.com.au",

      // Start from homepage + high-value sections
      seeds: [
        "https://monashstudentassociation.com.au",
        "https://monashstudentassociation.com.au/support",
        "https://monashstudentassociation.com.au/clubs",
        "https://monashstudentassociation.com.au/events",
        "https://monashstudentassociation.com.au/about",
        "https://monashstudentassociation.com.au/contact",
      ],

      allowPrefixes: [
        "https://monashstudentassociation.com.au",
      ],

      denySubstrings: [
        // robots.txt
        "/wp/wp-admin/",
        // WordPress internals
        "/wp-json/",
        "/xmlrpc.php",
        "/wp-login.php",

        // Low-value taxonomy spam
        "/tag/",
        "/category/",
        "/author/",
        "/page/",

        // Feeds & embeds
        "/feed/",
        "/embed/",

        // Tracking & noise
        "utm_",
        "fbclid=",
        "gclid=",
        "?share=",
        "?amp",
        "?replytocom=",
      ],

      maxPages: 1200,
      delayMs: 650,
    },
    */
  ];

import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const JUNK_SELECTORS = [
  // Global layout
  "nav",
  "header",
  "footer",
  "aside",

  // Common CMS junk
  ".breadcrumb",
  ".breadcrumbs",
  ".site-breadcrumb",
  ".page-breadcrumb",

  ".navigation",
  ".menu",
  ".submenu",

  ".hero",
  ".hero-image",
  ".banner",

  ".social",
  ".share",
  ".sharing",

  ".cta",
  ".button",
  ".btn",

  ".alert",
  ".notice",

  ".related",
  ".related-links",
  ".recommended",

  ".pagination",

  // Forms & scripts
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "script",
  "style",
  "noscript",

  // Images that are usually decorative
  "figure",
  "img",
  "svg",
];

export function extractToMarkdown(
  html: string,
  url: string
): { title: string; markdown: string } {
  /** 1. Run Readability */
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title =
    article?.title?.trim() ||
    dom.window.document.title ||
    url;

  const rawHtml =
    article?.content ||
    dom.window.document.body.innerHTML ||
    "";

  /** 2. Clean DOM before Turndown */
  const cleanDom = new JSDOM(rawHtml);
  const doc = cleanDom.window.document;

  // Remove obvious junk nodes
  for (const selector of JUNK_SELECTORS) {
    doc.querySelectorAll(selector).forEach((el: Element) => el.remove());
  }

  // Remove empty elements
  doc.querySelectorAll("*").forEach((el: Element) => {
    if (
      el.textContent?.trim() === "" &&
      el.children.length === 0
    ) {
      el.remove();
    }
  });

  /** 3. Turndown */
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
  });

  // Keep links clean (important for KB)
  turndown.addRule("cleanLinks", {
    filter: "a",
    replacement(content: string, node: HTMLElement): string {
      const href = (node as HTMLAnchorElement).getAttribute("href");
      if (!href) return content;
      return `[${content}](${href})`;
    },
  });

  const markdown = turndown.turndown(doc.body.innerHTML);

  return {
    title,
    markdown: markdown.trim(),
  };
}

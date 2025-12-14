import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export function extractToMarkdown(html: string, url: string): { title: string; markdown: string } {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title = article?.title?.trim() || dom.window.document.title || url;

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  const contentHtml = article?.content || dom.window.document.body.innerHTML || "";
  const markdown = turndown.turndown(contentHtml);

  return { title, markdown };
}

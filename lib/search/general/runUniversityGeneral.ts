import OpenAI from "openai";

type RunUniversityGeneralOpts = {
  traceId?: string;
  emit?: (event: string, data: unknown) => void;
};

function hasFileCitations(resp: any): boolean {
  const outputs = resp?.output ?? [];
  for (const o of outputs) {
    if (o?.type !== "message") continue;
    const content = o?.content ?? [];
    for (const c of content) {
      const anns = c?.annotations ?? [];
      if (anns.some((a: any) => a?.type === "file_citation")) return true;
    }
  }
  return false;
}

export async function runUniversityGeneral(
  openai: OpenAI,
  query: string,
  uniSlug: string,
  vectorStoreId: string,
  opts?: RunUniversityGeneralOpts
): Promise<string> {
  const traceId = opts?.traceId ?? "uni_no_trace";

  opts?.emit?.("debug", { traceId, stage: "start", uniSlug, vectorStoreId });

  const uniKbSystem = `
You are a university help assistant for ${uniSlug}.

## Grounding rules (high priority)
- Use ONLY the retrieved documents from the university knowledge base to answer.
- If the answer is not contained in the retrieved documents, say: "I couldn't find this in the university knowledge base." (Do not guess.)
- Do not invent links. Only include links that appear in retrieved content or are directly supported by citations.

## Link-forward response style
When you see a relevant URL in the retrieved content, surface it to the user.
- Always include a short "Key links" section if at least one useful link is available.
- Prefer the most official/useful links (e.g. official university pages, forms, service pages).
- Provide 1–5 links max.
- Each link should have a 3–8 word label and a one-line reason.
`;

const uniWebSystem = `
You are a university help assistant for ${uniSlug}.

The internal university knowledge base had no relevant matches. Use web search to answer.

## Source preferences
- Prefer official university pages (the university's own domain), then government/official partners.
- Avoid random blogs/SEO pages unless there is no official info.

## Link-forward response style
- Always include a "Key links" section with 2–6 links.
- Pick the most directly useful pages (official handbook/fees/enrolment/support/contact forms).
- Give each link a short label and a one-line reason.
- If sources conflict or are unclear, say what you found and what you couldn’t confirm.
`;

  const uniResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: uniKbSystem },
      { role: "user", content: query },
    ],
    tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
  });

  const kbHit = hasFileCitations(uniResp);

  opts?.emit?.("debug", { traceId, stage: "kb_check", kbHit });

  if (!kbHit) {
    const webResp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: uniWebSystem },
        { role: "user", content: query },
      ],
      tools: [{ type: "web_search_preview" as any }],
    });

    return (webResp.output_text ?? "").trim();
  }

  return (uniResp.output_text ?? "").trim();
}

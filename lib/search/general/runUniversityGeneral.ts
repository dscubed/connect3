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

  const uniResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: "You are a university help assistant. Use retrieved documents when available." },
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
        {
          role: "system",
          content: `You are a university assistant. The internal university knowledge base had no relevant matches.
Use web search to answer. Prefer official sources.
University: ${uniSlug}`,
        },
        { role: "user", content: query },
      ],
      tools: [{ type: "web_search_preview" as any }],
    });

    return (webResp.output_text ?? "").trim();
  }

  return (uniResp.output_text ?? "").trim();
}

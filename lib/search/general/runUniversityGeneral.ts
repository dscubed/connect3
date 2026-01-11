import OpenAI from "openai";
import { countWebSearchCalls } from "./countWebSearches";

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

  console.log("[runUniversityGeneral] start", {
    traceId,
    uniSlug,
    vectorStoreId,
  });

  const uniKbSystem = `
You are a university help assistant for ${uniSlug}.
...
`;

  const uniWebSystem = `
You are a university help assistant for ${uniSlug}.
...
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

  console.log("[runUniversityGeneral] kb_check", {
    traceId,
    kbHit,
  });

  if (!kbHit) {
    const webResp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: uniWebSystem },
        { role: "user", content: query },
      ],
      tools: [{ type: "web_search_preview" as any }],
    });

    console.log("[runUniversityGeneral] web_search_usage", {
      traceId,
      webCalls: countWebSearchCalls(webResp),
      inputTokens: webResp.usage?.input_tokens,
      outputTokens: webResp.usage?.output_tokens,
      totalTokens: webResp.usage?.total_tokens,
    });

    return (webResp.output_text ?? "").trim();
  }

  return (uniResp.output_text ?? "").trim();
}

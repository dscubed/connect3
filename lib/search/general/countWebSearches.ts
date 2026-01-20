import type { Response } from "openai/resources/responses/responses.mjs";

export function countWebSearchCalls(resp: Response): number {
  const outputs = resp?.output ?? [];
  return outputs.filter((o) => o?.type === "web_search_call").length;
}

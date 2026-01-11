export function countWebSearchCalls(resp: any): number {
    const outputs = resp?.output ?? [];
    return outputs.filter(
      (o: any) =>
        o?.type === "web_search_call" ||
        (o?.type === "tool_call" && o?.tool_name === "web_search_preview")
    ).length;
  }
  
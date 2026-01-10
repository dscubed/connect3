export type EmitFn = (event: string, data: unknown) => void;

export function mkTraceId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function dbg(emit: EmitFn | undefined, traceId: string, stage: string, data: Record<string, unknown> = {}) {
  const payload = { traceId, stage, ts: new Date().toISOString(), ...data };
  // Always log to console as fallback
  console.log(`[${traceId}] ${stage}`, payload);
  emit?.("debug", payload);
}

export function preview(str: string | null | undefined, n = 140) {
  const s = (str ?? "").replace(/\s+/g, " ").trim();
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}

/**
 * Robustly extract text even when output_text is empty but output[] contains message content.
 */
export function extractOutputText(resp: any): string {
  const ot = resp?.output_text;
  if (typeof ot === "string" && ot.trim()) return ot.trim();

  const parts: string[] = [];
  for (const item of resp?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const c of item?.content ?? []) {
      if (c?.type === "output_text" && typeof c?.text === "string") parts.push(c.text);
      if (c?.type === "text" && typeof c?.text === "string") parts.push(c.text);
    }
  }
  return parts.join("\n").trim();
}

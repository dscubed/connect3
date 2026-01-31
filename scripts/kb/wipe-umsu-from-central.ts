import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type Row = {
  kb_slug: string;
  doc_id: string;
  section_key: string;
  vector_store_id: string | null;
  vector_store_file_id: string | null;
  file_id: string | null;
  canonical_url: string | null;
  is_active: boolean;
};

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function main() {
  const [, , centralVsId, mode] = process.argv;
  if (!centralVsId) {
    console.error("Usage: tsx scripts/kb/wipe-umsu-from-central.ts <centralVectorStoreId> [delete|deactivate]");
    process.exit(1);
  }
  const doDelete = (mode ?? "deactivate") === "delete";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });
  const supabase = supabaseAdmin();

  // Pull ALL UMSU rows (active + inactive) so we can detach everything we know about
  const rows: Row[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("kb_document_files")
      .select("kb_slug,doc_id,section_key,vector_store_id,vector_store_file_id,file_id,canonical_url,is_active")
      .eq("site", "umsu")
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...(data as Row[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const targets = rows.filter(r => r.vector_store_id === centralVsId);

  console.log(`Found ${rows.length} kb_document_files rows with site=umsu`);
  console.log(`Of those, ${targets.length} point at central store ${centralVsId}`);

  // Detach from the central vector store
  let detached = 0;
  for (const r of targets) {
    if (!r.vector_store_file_id) continue;

    try {
      await openai.vectorStores.files.delete(r.vector_store_file_id, { vector_store_id: centralVsId });
      detached += 1;
    } catch (e: any) {
      console.warn("Detach failed:", r.vector_store_file_id, e?.message ?? e);
    }
  }

  console.log(`Detached ${detached} vector store files from ${centralVsId}`);

  // Now clean Supabase rows
  if (doDelete) {
    const { error } = await supabase
      .from("kb_document_files")
      .delete()
      .eq("site", "umsu");
    if (error) throw error;
    console.log("Deleted kb_document_files rows where site=umsu");
  } else {
    const { error } = await supabase
      .from("kb_document_files")
      .update({ is_active: false, last_fetched_at: new Date().toISOString() })
      .eq("site", "umsu");
    if (error) throw error;
    console.log("Deactivated kb_document_files rows where site=umsu (is_active=false)");
  }

  console.log("\nWipe complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

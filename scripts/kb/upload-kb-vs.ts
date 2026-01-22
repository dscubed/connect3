import fs from "node:fs";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { globSync } from "glob";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BATCH_SIZE = 50;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function usageAndExit() {
  console.error(
    "Usage: tsx scripts/kb/upload-kb-vector-store.ts <kbSlug> <kbDir> <domain>\n" +
      "Example: tsx scripts/kb/upload-kb-vector-store.ts umsu scripts/kb_scrapes/umsu umsu.unimelb.edu.au"
  );
  process.exit(1);
}

async function main() {
  const [, , kbSlug, kbDirArg, domain] = process.argv;
  if (!kbSlug || !kbDirArg || !domain) usageAndExit();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env.local or .env");

  const KB_DIR = path.resolve(process.cwd(), kbDirArg);
  const VECTOR_STORE_NAME = `kb_${kbSlug}`;

  if (!fs.existsSync(KB_DIR)) throw new Error(`KB directory not found: ${KB_DIR}`);

  const mdPaths = globSync(path.join(KB_DIR, "**/*.md"), { nodir: true });
  if (mdPaths.length === 0) throw new Error(`No .md files found under ${KB_DIR}`);

  console.log(`Found ${mdPaths.length} markdown files in ${KB_DIR}`);

  const openai = new OpenAI({ apiKey });

  const vectorStore = await openai.vectorStores.create({
    name: VECTOR_STORE_NAME,
    metadata: {
      kb: kbSlug,
      source: "scrape",
      domain,
    },
  });

  console.log(`Created vector store: ${vectorStore.id} (${VECTOR_STORE_NAME})`);

  const batches = chunk(mdPaths, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batchPaths = batches[i];

    console.log(`Uploading batch ${i + 1}/${batches.length} (${batchPaths.length} files)...`);

    const uploadables = await Promise.all(
      batchPaths.map(async (p) => toFile(fs.createReadStream(p), path.basename(p)))
    );

    const fileBatch = await openai.vectorStores.fileBatches.uploadAndPoll(
      vectorStore.id,
      { files: uploadables }
    );

    console.log(`Batch ${i + 1} status: ${fileBatch.status}`, "file_counts:", fileBatch.file_counts);

    if (fileBatch.status === "failed") {
      throw new Error(`Batch ${i + 1} failed: ${JSON.stringify(fileBatch.file_counts)}`);
    }
  }

  const finalStore = await openai.vectorStores.retrieve(vectorStore.id);
  console.log("Final vector store:", finalStore.id, "status:", finalStore.status, "file_counts:", finalStore.file_counts);

  console.log("\nDONE ✅");
  console.log("Vector Store ID:", finalStore.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

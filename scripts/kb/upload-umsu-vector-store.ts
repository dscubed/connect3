// scripts/kb/upload-umsu-vector-store.ts
import fs from "node:fs";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { globSync } from "glob";
import dotenv from "dotenv";

// Load .env.local first (Next.js style), then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const KB_DIR = path.resolve(process.cwd(), "scripts/kb_scrapes/umsu");
const VECTOR_STORE_NAME = "kb_umsu";

// Upload in batches to avoid too many open files / request sizes
const BATCH_SIZE = 50;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY. Put it in .env.local (recommended) or export it in your shell."
    );
  }

  if (!fs.existsSync(KB_DIR)) {
    throw new Error(`KB directory not found: ${KB_DIR}`);
  }

  const mdPaths = globSync(path.join(KB_DIR, "**/*.md"), { nodir: true });

  if (mdPaths.length === 0) {
    throw new Error(`No .md files found under ${KB_DIR}`);
  }

  console.log(`Found ${mdPaths.length} markdown files in ${KB_DIR}`);

  const openai = new OpenAI({ apiKey });

  // 1) Create vector store
  const vectorStore = await openai.vectorStores.create({
    name: VECTOR_STORE_NAME,
    metadata: {
      kb: "umsu",
      source: "scrape",
      domain: "umsu.unimelb.edu.au",
    },
  });

  console.log(`Created vector store: ${vectorStore.id} (${VECTOR_STORE_NAME})`);

  // 2) Upload in batches + poll for indexing
  const batches = chunk(mdPaths, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batchPaths = batches[i];

    console.log(
      `Uploading batch ${i + 1}/${batches.length} (${batchPaths.length} files)...`
    );

    // Convert to Uploadables with filenames (robust for TS + runtime)
    const uploadables = await Promise.all(
      batchPaths.map(async (p) => {
        const rs = fs.createReadStream(p);
        return toFile(rs, path.basename(p));
      })
    );

    // Upload + attach + poll until processed
    const fileBatch = await openai.vectorStores.fileBatches.uploadAndPoll(
        vectorStore.id,
        { files: uploadables }
    );

    console.log(
      `Batch ${i + 1} status: ${fileBatch.status}`,
      "file_counts:",
      fileBatch.file_counts
    );

    // Optional: fail fast if something goes wrong
    if (fileBatch.status === "failed") {
      throw new Error(
        `Vector store file batch ${i + 1} failed. file_counts=${JSON.stringify(
          fileBatch.file_counts
        )}`
      );
    }
  }

  // 3) Confirm final vector store status
  const finalStore = await openai.vectorStores.retrieve(vectorStore.id);
  console.log(
    "Final vector store:",
    finalStore.id,
    "status:",
    finalStore.status,
    "file_counts:",
    finalStore.file_counts
  );

  console.log("\nDONE ✅");
  console.log("Save this Vector Store ID (you’ll need it for kb_registry):");
  console.log(finalStore.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

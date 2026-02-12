// app/api/cron/profile-upload-worker/route.ts
//
// Next.js API route — processes profile_upload_jobs queue.
// Invoked by Supabase pg_cron every minute via HTTP POST.
//
// Flow per job:
//   1. Lock the profile row (SELECT ... FOR UPDATE)
//   2. Upload profile using uploadProfileToVectorStore
//   3. Update profiles.openai_file_id
//   4. Mark job completed

import { createClient } from "@supabase/supabase-js";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/upload";

// ─── Config ──────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;
const cronSecret = process.env.CRON_SECRET!;

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// ─── Helpers ─────────────────────────────────────────────────────

async function processJob(job: { id: string; user_id: string }) {
  const { id: jobId, user_id: userId } = job;

  console.log(`Processing job ${jobId} for user ${userId}`);

  // Mark job as processing
  await supabase
    .from("profile_upload_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", jobId);

  try {
    // ── 1. Row-lock the profile to prevent concurrent uploads ────
    const { error: lockError } = await supabase.rpc("lock_profile_for_upload", {
      p_user_id: userId,
    });

    if (lockError) {
      throw new Error(`Failed to lock profile: ${lockError.message}`);
    }

    // ── 2. Upload profile to vector store ────────────────────────
    // This handles: fetching user details, deleting old file,
    // generating text, uploading to OpenAI, and setting attributes
    const fileId = await uploadProfileToVectorStore({
      userId,
      supabase,
    });

    // ── 3. Update profile with new file ID ───────────────────────
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ openai_file_id: fileId })
      .eq("id", userId);

    if (updateError) {
      throw new Error(
        `Failed to update profile with new file ID: ${updateError.message}`,
      );
    }

    // ── 4. Mark job completed ────────────────────────────────────
    await supabase
      .from("profile_upload_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(
      `✅ Job ${jobId} completed — file ${fileId} uploaded for user ${userId}`,
    );
  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error);

    await supabase
      .from("profile_upload_jobs")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}

// ─── Main handler ────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    // Verify the request is from Supabase pg_cron via CRON_SECRET
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all pending jobs, oldest first
    const { data: jobs, error } = await supabase
      .from("profile_upload_jobs")
      .select("id, user_id")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error fetching jobs:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return Response.json({ message: "No pending jobs" }, { status: 200 });
    }

    console.log(`Found ${jobs.length} pending jobs`);

    // Deduplicate: if multiple jobs exist for the same user, only process the latest
    const latestJobPerUser = new Map<string, { id: string; user_id: string }>();
    const jobsToSkip: string[] = [];

    for (const job of jobs) {
      if (latestJobPerUser.has(job.user_id)) {
        // Mark the older job as skipped
        jobsToSkip.push(latestJobPerUser.get(job.user_id)!.id);
      }
      latestJobPerUser.set(job.user_id, job);
    }

    // Mark skipped jobs as completed (deduplicated)
    if (jobsToSkip.length > 0) {
      await supabase
        .from("profile_upload_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          error: "Deduplicated — newer job exists",
        })
        .in("id", jobsToSkip);
    }

    // Process remaining jobs in parallel (row lock per user prevents overlap)
    await Promise.all(
      Array.from(latestJobPerUser.values()).map((job) => processJob(job)),
    );

    return Response.json(
      {
        processed: latestJobPerUser.size,
        skipped: jobsToSkip.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Worker error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

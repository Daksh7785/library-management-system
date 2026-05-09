/**
 * AcademicOS — Production ETL Pipeline
 * 
 * Streams Open Library .gz dumps line-by-line, batch-inserts into Supabase,
 * and pushes enrichment + index jobs to Redis (BullMQ).
 * 
 * Usage:
 *   npx tsx scripts/etl_pipeline.ts ol_dump_works_latest.txt.gz
 */

import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// ── Config ─────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const FILE_PATH = process.argv[2] || 'ol_dump_works_latest.txt.gz';
const BATCH_SIZE = 5000;

// ── Clients ────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

let enrichmentQueue: Queue | null = null;
let indexQueue: Queue | null = null;

async function initQueues() {
  try {
    const connection = { url: REDIS_URL };
    enrichmentQueue = new Queue('enrichment', { connection });
    indexQueue = new Queue('index-sync', { connection });
    console.log('✅ Redis queues connected');
  } catch (e) {
    console.warn('⚠️  Redis not available — skipping queue jobs. Books will still be inserted.');
  }
}

// ── Parse one Open Library line ────────────────────
function parseLine(line: string): Record<string, any> | null {
  try {
    const parts = line.split('\t');
    if (parts.length < 5) return null;

    const data = JSON.parse(parts[4]);
    if (!data.title) return null;

    // Extract description
    let description: string | null = null;
    if (typeof data.description === 'string') {
      description = data.description.substring(0, 2000);
    } else if (data.description?.value) {
      description = data.description.value.substring(0, 2000);
    }

    // Extract subjects (capped at 10)
    const subjects = (data.subjects || [])
      .slice(0, 10)
      .map((s: any) => (typeof s === 'string' ? s : s.name || ''))
      .filter(Boolean);

    return {
      title: data.title.substring(0, 500),
      subtitle: data.subtitle?.substring(0, 500) || null,
      author: data.authors?.[0]?.author?.key || 'Unknown',
      open_lib_id: data.key?.replace('/works/', '') || null,
      description,
      subjects: subjects.length > 0 ? subjects : null,
      published_year: data.first_publish_year || null,
      cover_url: data.covers?.[0] ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : null,
      language: 'en',
      source: 'ol_dump',
      confidence_score: 0.8,
      available: true,
    };
  } catch {
    return null;
  }
}

// ── Insert a batch into Supabase ───────────────────
async function insertBatch(batch: Record<string, any>[]): Promise<string[]> {
  const { data, error } = await supabase
    .from('books')
    .upsert(batch, { onConflict: 'open_lib_id', ignoreDuplicates: true })
    .select('id');

  if (error) {
    console.error(`  ❌ Batch error: ${error.message}`);
    return [];
  }

  return (data || []).map((r: any) => r.id);
}

// ── Push jobs to Redis queues ──────────────────────
async function pushJobs(bookIds: string[]) {
  if (!enrichmentQueue || !indexQueue || bookIds.length === 0) return;

  // Enrichment: fetch covers + descriptions from Google
  const enrichJobs = bookIds.map((id) => ({
    name: `enrich-${id}`,
    data: { bookId: id },
    opts: { attempts: 3, backoff: { type: 'exponential' as const, delay: 5000 } },
  }));
  await enrichmentQueue.addBulk(enrichJobs);

  // Index sync: push to Meilisearch
  await indexQueue.add('batch-index', { bookIds }, { attempts: 2 });
}

// ── Log job to DB ──────────────────────────────────
async function logJob(
  jobType: string,
  status: string,
  processed: number,
  failed: number,
  errorMsg?: string
) {
  await supabase.from('job_log').insert({
    job_type: jobType,
    status,
    records_processed: processed,
    records_failed: failed,
    error_message: errorMsg || null,
    completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
  });
}

// ── Main ───────────────────────────────────────────
async function main() {
  if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env');
    process.exit(1);
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ File not found: ${FILE_PATH}`);
    process.exit(1);
  }

  await initQueues();

  console.log(`\n🚀 AcademicOS ETL Pipeline`);
  console.log(`   File: ${FILE_PATH}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Target: ${SUPABASE_URL}\n`);

  const startTime = Date.now();
  const stream = fs.createReadStream(FILE_PATH).pipe(zlib.createGunzip());
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let batch: Record<string, any>[] = [];
  let totalProcessed = 0;
  let totalInserted = 0;
  let totalFailed = 0;
  let batchNumber = 0;

  await logJob('etl_import', 'running', 0, 0);

  for await (const line of rl) {
    totalProcessed++;
    const parsed = parseLine(line);
    if (!parsed) continue;

    batch.push(parsed);

    if (batch.length >= BATCH_SIZE) {
      batchNumber++;
      const ids = await insertBatch(batch);
      totalInserted += ids.length;
      totalFailed += batch.length - ids.length;

      await pushJobs(ids);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (totalProcessed / parseFloat(elapsed)).toFixed(0);
      console.log(
        `  📦 Batch #${batchNumber} | ` +
        `Processed: ${totalProcessed.toLocaleString()} | ` +
        `Inserted: ${totalInserted.toLocaleString()} | ` +
        `Rate: ${rate}/sec | ` +
        `Elapsed: ${elapsed}s`
      );

      batch = [];
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const ids = await insertBatch(batch);
    totalInserted += ids.length;
    totalFailed += batch.length - ids.length;
    await pushJobs(ids);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  await logJob('etl_import', 'completed', totalInserted, totalFailed);

  console.log(`\n✅ ETL Complete`);
  console.log(`   Total processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Total inserted:  ${totalInserted.toLocaleString()}`);
  console.log(`   Total failed:    ${totalFailed.toLocaleString()}`);
  console.log(`   Duration:        ${totalTime}s\n`);

  // Cleanup
  await enrichmentQueue?.close();
  await indexQueue?.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

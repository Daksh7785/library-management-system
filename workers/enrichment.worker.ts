/**
 * AcademicOS — Enrichment Worker
 * 
 * Picks up books inserted by ETL that have source='ol_dump' and:
 *  1. Fetches richer metadata from Google Books API
 *  2. Uploads cover images to Cloudflare R2
 *  3. Updates the DB record
 */

import { Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
});

const BUCKET = process.env.R2_BUCKET || 'academicos-covers';
const R2_PUBLIC = process.env.R2_PUBLIC_URL || '';
const GOOGLE_KEY = process.env.GOOGLE_BOOKS_API_KEY || '';

// ── Fetch richer data from Google Books ────────────
async function fetchGoogleData(title: string, author: string) {
  const q = encodeURIComponent(`${title} ${author}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1${GOOGLE_KEY ? `&key=${GOOGLE_KEY}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const json = await res.json();
  if (!json.items?.length) return null;

  const v = json.items[0].volumeInfo;
  return {
    description: v.description?.substring(0, 2000) || null,
    publisher: v.publisher || null,
    published_year: v.publishedDate ? parseInt(v.publishedDate.substring(0, 4)) : null,
    total_pages: v.pageCount || null,
    pages: v.pageCount || null,
    category: v.categories?.[0] || null,
    cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    isbn_13: v.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || null,
    google_id: json.items[0].id,
    language: v.language || null,
  };
}

// ── Upload cover to R2 ────────────────────────────
async function uploadCoverToR2(bookId: string, imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const key = `covers/${bookId}.jpg`;

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    }));

    return `${R2_PUBLIC}/${key}`;
  } catch (e) {
    console.warn(`  ⚠️  R2 upload failed for ${bookId}:`, (e as Error).message);
    return null;
  }
}

// ── Process a single job ──────────────────────────
async function processJob(job: Job) {
  const { bookId } = job.data;

  // 1. Get current book data
  const { data: book, error } = await supabase
    .from('books')
    .select('id, title, author, description, cover_url, google_id')
    .eq('id', bookId)
    .single();

  if (error || !book) {
    console.warn(`  ⚠️  Book ${bookId} not found, skipping`);
    return;
  }

  // 2. Skip if already enriched
  if (book.google_id && book.description) {
    return;
  }

  // 3. Fetch from Google
  const google = await fetchGoogleData(book.title, book.author);
  if (!google) return;

  // 4. Upload cover to R2 if available
  let r2CoverUrl: string | null = null;
  const coverSource = google.cover_url || book.cover_url;
  if (coverSource && process.env.R2_ACCESS_KEY) {
    r2CoverUrl = await uploadCoverToR2(bookId, coverSource);
  }

  // 5. Update DB — only fill missing fields
  const updates: Record<string, any> = {};
  if (!book.description && google.description) updates.description = google.description;
  if (google.publisher) updates.publisher = google.publisher;
  if (google.published_year) updates.published_year = google.published_year;
  if (google.total_pages) updates.total_pages = google.total_pages;
  if (google.category) updates.category = google.category;
  if (google.isbn_13) updates.isbn_13 = google.isbn_13;
  if (google.google_id) updates.google_id = google.google_id;
  if (r2CoverUrl) updates.cover_url = r2CoverUrl;
  else if (google.cover_url && !book.cover_url) updates.cover_url = google.cover_url;

  if (Object.keys(updates).length > 0) {
    updates.confidence_score = 0.95;
    updates.updated_at = new Date().toISOString();
    await supabase.from('books').update(updates).eq('id', bookId);
  }
}

// ── Start Worker ──────────────────────────────────
const worker = new Worker('enrichment', processJob, {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
  concurrency: 5,
  limiter: { max: 10, duration: 1000 }, // 10 jobs/sec to stay within Google rate limits
});

worker.on('completed', (job) => {
  // Silent unless debugging
});

worker.on('failed', (job, err) => {
  console.error(`  ❌ Enrichment failed [${job?.id}]:`, err.message);
});

worker.on('ready', () => {
  console.log('🔧 Enrichment Worker started — waiting for jobs...');
});

/**
 * AcademicOS — Index Sync Worker
 * 
 * Receives batches of book IDs from the ETL pipeline or enrichment worker
 * and syncs them into Meilisearch for instant search.
 */

import { Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const meili = new MeiliSearch({
  host: process.env.VITE_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.VITE_MEILISEARCH_API_KEY || '',
});

// ── Configure Meilisearch index on startup ────────
async function configureIndex() {
  const index = meili.index('books');

  await index.updateSettings({
    searchableAttributes: ['title', 'subtitle', 'author', 'isbn_13', 'description', 'subjects', 'category'],
    filterableAttributes: ['category', 'language', 'published_year', 'source', 'available'],
    sortableAttributes: ['published_year', 'rating', 'confidence_score', 'created_at'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    pagination: { maxTotalHits: 10000 },
  });

  console.log('  📐 Meilisearch index configured');
}

// ── Process batch ─────────────────────────────────
async function processJob(job: Job) {
  const { bookIds } = job.data;

  if (!bookIds || bookIds.length === 0) return;

  // Fetch full book data from Supabase
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, subtitle, author, isbn_13, description, category, subjects, published_year, cover_url, rating, language, source, confidence_score, available, created_at')
    .in('id', bookIds);

  if (error || !books || books.length === 0) {
    console.warn(`  ⚠️  No books found for batch, skipping`);
    return;
  }

  // Transform for Meilisearch
  const documents = books.map((b) => ({
    id: b.id,
    title: b.title || '',
    subtitle: b.subtitle || '',
    author: b.author || '',
    isbn_13: b.isbn_13 || '',
    description: (b.description || '').substring(0, 500),
    category: b.category || 'Uncategorized',
    subjects: b.subjects || [],
    published_year: b.published_year || 0,
    cover_url: b.cover_url || '',
    rating: b.rating || 0,
    language: b.language || 'en',
    source: b.source || 'unknown',
    confidence_score: b.confidence_score || 0,
    available: b.available ?? true,
    created_at: b.created_at || '',
  }));

  // Push to Meilisearch
  const index = meili.index('books');
  await index.addDocuments(documents, { primaryKey: 'id' });
}

// ── Start Worker ──────────────────────────────────
const worker = new Worker('index-sync', processJob, {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
  concurrency: 3,
});

worker.on('completed', (job) => {
  const count = job?.data?.bookIds?.length || 0;
  if (count > 0) console.log(`  🔍 Indexed ${count} books in Meilisearch`);
});

worker.on('failed', (job, err) => {
  console.error(`  ❌ Index sync failed [${job?.id}]:`, err.message);
});

worker.on('ready', async () => {
  await configureIndex();
  console.log('🔍 Index Sync Worker started — waiting for jobs...');
});

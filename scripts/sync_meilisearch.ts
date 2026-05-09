import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_MASTER_KEY });

async function sync() {
  console.log('🔄 Starting Meilisearch Sync...');
  
  const index = meili.index('books');

  // 1. Configure Index (Settings)
  await index.updateSettings({
    searchableAttributes: ['title', 'subtitle', 'author', 'isbn_13', 'subjects', 'description'],
    filterableAttributes: ['category', 'language', 'published_year', 'source'],
    sortableAttributes: ['published_year', 'rating'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'confidence_score:desc'
    ]
  });

  // 2. Fetch all books in batches
  let offset = 0;
  const LIMIT = 5000;
  let hasMore = true;

  while (hasMore) {
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .range(offset, offset + LIMIT - 1);

    if (error) {
      console.error('Fetch error:', error);
      break;
    }

    if (!books || books.length === 0) {
      hasMore = false;
      break;
    }

    // 3. Transform for Meilisearch (Meili likes camelCase or specific formats)
    const documents = books.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      author: b.author,
      isbn_13: b.isbn_13,
      description: b.description,
      category: b.category,
      subjects: b.subjects,
      published_year: b.published_year,
      cover_url: b.cover_url,
      rating: b.rating,
      source: b.source,
      confidence_score: b.confidence_score
    }));

    // 4. Upload Batch
    const task = await index.addDocuments(documents);
    console.log(`📤 Uploaded batch ${offset} to ${offset + documents.length} (Task ID: ${task.taskUid})`);

    offset += LIMIT;
    if (books.length < LIMIT) hasMore = false;
  }

  console.log('✅ Meilisearch Sync Complete!');
}

sync().catch(console.error);

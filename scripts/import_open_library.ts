import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Needs service role for batch bypass

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BATCH_SIZE = 2000;
const FILE_PATH = process.argv[2] || 'ol_dump_works_latest.txt.gz';

async function importBooks() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    return;
  }

  console.log(`🚀 Starting import from ${FILE_PATH}...`);
  
  const stream = fs.createReadStream(FILE_PATH).pipe(zlib.createGunzip());
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let batch: any[] = [];
  let totalProcessed = 0;
  let totalInserted = 0;

  for await (const line of rl) {
    totalProcessed++;
    try {
      // Open Library dumps are tab-separated: type, key, revision, last_modified, json
      const parts = line.split('\t');
      if (parts.length < 5) continue;
      
      const data = JSON.parse(parts[4]);
      
      const book = {
        title: data.title,
        subtitle: data.subtitle,
        author: data.authors?.[0]?.author?.key || 'Unknown', // This is a reference, ideally we'd resolve it
        open_lib_id: data.key.replace('/works/', ''),
        subjects: data.subjects || [],
        published_year: data.first_publish_year || null,
        description: typeof data.description === 'string' ? data.description.substring(0, 1000) : data.description?.value?.substring(0, 1000),
        source: 'ol_dump',
        confidence_score: 0.8,
        available: true
      };

      batch.push(book);

      if (batch.length >= BATCH_SIZE) {
        const { error } = await supabase.from('books').upsert(batch, { onConflict: 'open_lib_id' });
        if (error) console.error('Batch error:', error.message);
        else totalInserted += batch.length;
        
        console.log(`📊 Progress: ${totalProcessed.toLocaleString()} processed, ${totalInserted.toLocaleString()} inserted...`);
        batch = [];
      }
    } catch (err) {
      // Skip malformed lines
    }
  }

  // Final batch
  if (batch.length > 0) {
    await supabase.from('books').upsert(batch, { onConflict: 'open_lib_id' });
    totalInserted += batch.length;
  }

  console.log(`✅ Import Complete! Total: ${totalInserted.toLocaleString()} books.`);
}

importBooks().catch(console.error);

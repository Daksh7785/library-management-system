/**
 * AcademicOS — Search Service
 * 
 * Connected to Meilisearch for instant search with fallback to Supabase.
 * Used by all frontend pages that need search.
 */

import { Meilisearch } from 'meilisearch';
import type { SearchResponse } from 'meilisearch';
import { supabase } from '../lib/supabase';

// ── Meilisearch client (browser-safe) ─────────────
const MEILI_HOST = import.meta.env.VITE_MEILISEARCH_HOST || '';
const MEILI_KEY = import.meta.env.VITE_MEILISEARCH_API_KEY || '';

let meili: Meilisearch | null = null;
if (MEILI_HOST) {
  meili = new Meilisearch({ host: MEILI_HOST, apiKey: MEILI_KEY });
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  isbn_13?: string;
  description?: string;
  category?: string;
  subjects?: string[];
  published_year?: number;
  cover_url?: string;
  rating?: number;
  language?: string;
  source?: string;
}

export interface SearchOptions {
  query: string;
  page?: number;
  limit?: number;
  filters?: {
    category?: string;
    language?: string;
    yearFrom?: number;
    yearTo?: number;
  };
  sort?: string;
}

// ── Primary: Meilisearch ──────────────────────────
async function searchMeili(opts: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
  if (!meili) throw new Error('Meilisearch not configured');

  const index = meili.index('books');
  const page = opts.page || 1;
  const limit = opts.limit || 20;

  // Build filter string
  const filters: string[] = [];
  if (opts.filters?.category) filters.push(`category = "${opts.filters.category}"`);
  if (opts.filters?.language) filters.push(`language = "${opts.filters.language}"`);
  if (opts.filters?.yearFrom) filters.push(`published_year >= ${opts.filters.yearFrom}`);
  if (opts.filters?.yearTo) filters.push(`published_year <= ${opts.filters.yearTo}`);

  const response: SearchResponse = await index.search(opts.query, {
    offset: (page - 1) * limit,
    limit,
    filter: filters.length > 0 ? filters.join(' AND ') : undefined,
    sort: opts.sort ? [opts.sort] : undefined,
    attributesToHighlight: ['title', 'author'],
    attributesToCrop: ['description'],
    cropLength: 100,
  });

  return {
    results: response.hits as SearchResult[],
    total: response.estimatedTotalHits || 0,
  };
}

// ── Fallback: Supabase full-text ──────────────────
async function searchSupabase(opts: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('books')
    .select('id, title, subtitle, author, isbn_13, description, category, subjects, published_year, cover_url, rating, language, source', { count: 'exact' });

  if (opts.query) {
    query = query.or(`title.ilike.%${opts.query}%,author.ilike.%${opts.query}%`);
  }
  if (opts.filters?.category) {
    query = query.eq('category', opts.filters.category);
  }
  if (opts.filters?.language) {
    query = query.eq('language', opts.filters.language);
  }

  query = query.range(offset, offset + limit - 1).order('rating', { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    console.error('Supabase search error:', error);
    return { results: [], total: 0 };
  }

  return {
    results: (data || []) as SearchResult[],
    total: count || 0,
  };
}

// ── Public API ────────────────────────────────────
export const SearchService = {
  /**
   * Search books — uses Meilisearch when available, falls back to Supabase.
   */
  async search(opts: SearchOptions): Promise<{ results: SearchResult[]; total: number; engine: string }> {
    // Try Meilisearch first
    if (meili) {
      try {
        const result = await searchMeili(opts);
        return { ...result, engine: 'meilisearch' };
      } catch (e) {
        console.warn('Meilisearch failed, falling back to Supabase:', (e as Error).message);
      }
    }

    // Fallback
    const result = await searchSupabase(opts);
    return { ...result, engine: 'supabase' };
  },

  /**
   * Log a search to history for personalization.
   */
  async logSearch(userId: string, query: string, resultsCount: number) {
    await supabase.from('search_history').insert({
      user_id: userId,
      query,
      results_count: resultsCount,
      source: meili ? 'meilisearch' : 'supabase',
    });
  },
};

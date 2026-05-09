/**
 * AcademicOS — Book Service
 * 
 * All book CRUD operations. Connected to real Supabase tables.
 * This replaces the scattered api.ts functions.
 */

import { supabase } from '../lib/supabase';

export interface BookRecord {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  isbn?: string;
  isbn_13?: string;
  isbn_10?: string;
  open_lib_id?: string;
  google_id?: string;
  description?: string;
  cover_url?: string;
  publisher?: string;
  published_year?: number;
  total_pages?: number;
  pages?: number;
  language?: string;
  genre?: string;
  category?: string;
  tags?: string[];
  subjects?: string[];
  rating?: number;
  ratings_count?: number;
  source?: string;
  confidence_score?: number;
  available?: boolean;
  created_at?: string;
}

export const BookService = {
  // ── Get all books (paginated) ───────────────────
  async list(page = 1, limit = 20, category?: string) {
    const offset = (page - 1) * limit;
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);

    const { data, count, error } = await query;
    if (error) throw error;
    return { books: data as BookRecord[], total: count || 0 };
  },

  // ── Get single book by ID ──────────────────────
  async getById(id: string): Promise<BookRecord | null> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as BookRecord;
  },

  // ── Universal Add Book ─────────────────────────
  // POST /books/add logic:
  //  1. Check DB by ISBN or title
  //  2. If not found, fetch from Google + OpenLibrary
  //  3. Merge, store, return
  async addBook(input: { query?: string; isbn?: string }): Promise<BookRecord | null> {
    const searchTerm = input.isbn || input.query || '';
    if (!searchTerm) return null;

    // 1. Check DB first
    let existing = null;
    if (input.isbn) {
      const { data } = await supabase
        .from('books')
        .select('*')
        .or(`isbn.eq.${input.isbn},isbn_13.eq.${input.isbn}`)
        .limit(1)
        .single();
      existing = data;
    }
    if (!existing && input.query) {
      const { data } = await supabase
        .from('books')
        .select('*')
        .ilike('title', `%${input.query}%`)
        .limit(1)
        .single();
      existing = data;
    }
    if (existing) return existing as BookRecord;

    // 2. Fetch from external APIs in parallel
    const [googleResult, olResult] = await Promise.allSettled([
      this._fetchGoogle(searchTerm),
      this._fetchOpenLibrary(searchTerm),
    ]);

    const google = googleResult.status === 'fulfilled' ? googleResult.value : null;
    const ol = olResult.status === 'fulfilled' ? olResult.value : null;

    if (!google && !ol) return null;

    // 3. Merge (Google is primary)
    const merged: Record<string, any> = {
      title: google?.title || ol?.title || searchTerm,
      subtitle: google?.subtitle || ol?.subtitle || null,
      author: google?.author || ol?.author || 'Unknown',
      isbn_13: google?.isbn_13 || ol?.isbn_13 || null,
      isbn_10: google?.isbn_10 || ol?.isbn_10 || null,
      description: google?.description || ol?.description || null,
      publisher: google?.publisher || null,
      published_year: google?.published_year || ol?.published_year || null,
      category: google?.category || null,
      subjects: [...new Set([...(google?.subjects || []), ...(ol?.subjects || [])])],
      cover_url: google?.cover_url || ol?.cover_url || null,
      pages: google?.pages || null,
      total_pages: google?.pages || null,
      language: google?.language || ol?.language || 'en',
      open_lib_id: ol?.open_lib_id || null,
      google_id: google?.google_id || null,
      source: 'api_merged',
      confidence_score: 0.95,
      available: true,
    };

    // 4. Insert into DB
    const { data, error } = await supabase
      .from('books')
      .insert(merged)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return null;
    }

    return data as BookRecord;
  },

  // ── Google Books API ───────────────────────────
  async _fetchGoogle(query: string) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`
      );
      const json = await res.json();
      if (!json.items?.length) return null;

      const v = json.items[0].volumeInfo;
      return {
        title: v.title,
        subtitle: v.subtitle,
        author: v.authors?.join(', ') || 'Unknown',
        isbn_13: v.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier,
        isbn_10: v.industryIdentifiers?.find((i: any) => i.type === 'ISBN_10')?.identifier,
        description: v.description?.substring(0, 2000),
        publisher: v.publisher,
        published_year: v.publishedDate ? parseInt(v.publishedDate.substring(0, 4)) : null,
        category: v.categories?.[0],
        subjects: v.categories || [],
        cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:'),
        pages: v.pageCount,
        language: v.language,
        google_id: json.items[0].id,
      };
    } catch {
      return null;
    }
  },

  // ── Open Library API ───────────────────────────
  async _fetchOpenLibrary(query: string) {
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`
      );
      const json = await res.json();
      if (!json.docs?.length) return null;

      const doc = json.docs[0];
      return {
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
        isbn_13: doc.isbn?.find((i: string) => i.length === 13),
        isbn_10: doc.isbn?.find((i: string) => i.length === 10),
        description: null,
        published_year: doc.first_publish_year,
        subjects: (doc.subject || []).slice(0, 10),
        open_lib_id: doc.key?.replace('/works/', ''),
        cover_url: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : null,
        language: doc.language?.[0],
        subtitle: null,
      };
    } catch {
      return null;
    }
  },

  // ── Get categories for filters ─────────────────
  async getCategories(): Promise<string[]> {
    const { data } = await supabase
      .from('books')
      .select('category')
      .not('category', 'is', null)
      .limit(100);

    const cats = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))];
    return cats.sort();
  },
};

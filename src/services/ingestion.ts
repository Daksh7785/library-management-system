import { supabase } from '../lib/supabase';

export interface UniversalBookData {
  title: string;
  subtitle?: string;
  author: string;
  isbn_13?: string;
  isbn_10?: string;
  description?: string;
  publisher?: string;
  published_year?: number;
  category?: string;
  subjects?: string[];
  cover_url?: string;
  pages?: number;
  language?: string;
  open_lib_id?: string;
  google_id?: string;
  source: string;
  confidence_score: number;
}

/**
 * Universal Book Ingestion Service
 * Fetches data from multiple sources in parallel and merges the best results.
 */
export class IngestionService {
  
  static async searchAndAdd(query: string, libraryId?: string): Promise<UniversalBookData | null> {
    try {
      console.log(`🔍 Ingesting book: ${query}`);
      
      // Parallel fetch from multiple sources
      const [google, openLib] = await Promise.allSettled([
        this.fetchGoogleBooks(query),
        this.fetchOpenLibrary(query)
      ]);

      const sources: any[] = [];
      if (google.status === 'fulfilled' && google.value) sources.push(google.value);
      if (openLib.status === 'fulfilled' && openLib.value) sources.push(openLib.value);

      if (sources.length === 0) return null;

      // Merge results
      const merged = this.mergeSources(sources);
      
      // Save to Database
      const saved = await this.saveToDatabase(merged, libraryId);
      
      return saved;
    } catch (error) {
      console.error('Ingestion error:', error);
      return null;
    }
  }

  private static async fetchGoogleBooks(query: string): Promise<Partial<UniversalBookData> | null> {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
      const data = await res.json();
      if (!data.items?.length) return null;
      
      const v = data.items[0].volumeInfo;
      return {
        title: v.title,
        subtitle: v.subtitle,
        author: v.authors?.join(', ') || 'Unknown',
        isbn_13: v.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier,
        isbn_10: v.industryIdentifiers?.find((i: any) => i.type === 'ISBN_10')?.identifier,
        description: v.description,
        publisher: v.publisher,
        published_year: v.publishedDate ? parseInt(v.publishedDate.substring(0, 4)) : undefined,
        category: v.categories?.[0],
        subjects: v.categories || [],
        cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:'),
        pages: v.pageCount,
        language: v.language,
        google_id: data.items[0].id,
        source: 'google',
        confidence_score: 0.95
      };
    } catch (e) { return null; }
  }

  private static async fetchOpenLibrary(query: string): Promise<Partial<UniversalBookData> | null> {
    try {
      // Search first
      const searchRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`);
      const searchData = await searchRes.json();
      if (!searchData.docs?.length) return null;
      
      const doc = searchData.docs[0];
      return {
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
        isbn_13: doc.isbn?.find((i: string) => i.length === 13),
        isbn_10: doc.isbn?.find((i: string) => i.length === 10),
        published_year: doc.first_publish_year,
        subjects: doc.subject || [],
        open_lib_id: doc.key.replace('/works/', ''),
        cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
        language: doc.language?.[0],
        source: 'open_library',
        confidence_score: 0.9
      };
    } catch (e) { return null; }
  }

  private static mergeSources(sources: Partial<UniversalBookData>[]): UniversalBookData {
    const primary = sources.find(s => s.source === 'google') || sources[0];
    const secondary = sources.find(s => s.source !== primary.source);

    return {
      title: primary.title || secondary?.title || '',
      subtitle: primary.subtitle || secondary?.subtitle,
      author: primary.author || secondary?.author || 'Unknown',
      isbn_13: primary.isbn_13 || secondary?.isbn_13,
      isbn_10: primary.isbn_10 || secondary?.isbn_10,
      description: primary.description || secondary?.description,
      publisher: primary.publisher || secondary?.publisher,
      published_year: primary.published_year || secondary?.published_year,
      category: primary.category || secondary?.category,
      subjects: Array.from(new Set([...(primary.subjects || []), ...(secondary?.subjects || [])])),
      cover_url: primary.cover_url || secondary?.cover_url,
      pages: primary.pages || secondary?.pages,
      language: primary.language || secondary?.language,
      open_lib_id: primary.open_lib_id || secondary?.open_lib_id,
      google_id: primary.google_id || secondary?.google_id,
      source: 'merged',
      confidence_score: Math.max(primary.confidence_score || 0, secondary?.confidence_score || 0)
    };
  }

  private static async saveToDatabase(book: UniversalBookData, libraryId?: string): Promise<UniversalBookData | null> {
    const { data, error } = await supabase.from('books').upsert({
      library_id: libraryId,
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      isbn_13: book.isbn_13,
      isbn_10: book.isbn_10,
      description: book.description,
      publisher: book.publisher,
      published_year: book.published_year,
      category: book.category,
      subjects: book.subjects,
      cover_url: book.cover_url,
      pages: book.pages,
      language: book.language,
      open_lib_id: book.open_lib_id,
      google_id: book.google_id,
      source: book.source,
      confidence_score: book.confidence_score,
      available: true
    }, { onConflict: 'isbn_13' }).select().single();

    if (error) {
      console.error('DB Insert Error:', error);
      return null;
    }
    return data;
  }
}

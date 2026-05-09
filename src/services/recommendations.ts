/**
 * AcademicOS — Recommendation Service
 *
 * Generates personalized book recommendations based on:
 *  1. User's reading history subjects
 *  2. Highly-rated books they haven't read
 *  3. Trending books (fallback)
 */

import { supabase } from '../lib/supabase';

export interface Recommendation {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  category: string;
  reason: string;
}

export const RecommendationService = {
  async getForUser(userId: string): Promise<Recommendation[]> {
    try {
      // 1. Get user's completed and reading books with their subjects
      const { data: userBooks } = await supabase
        .from('user_books')
        .select('book_id, status, rating, books(subjects, category)')
        .eq('user_id', userId)
        .in('status', ['completed', 'reading'])
        .order('updated_at', { ascending: false })
        .limit(20);

      if (!userBooks || userBooks.length === 0) {
        return this.getTrending();
      }

      // 2. Extract top subjects
      const subjectCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const readBookIds = userBooks.map((ub) => ub.book_id);

      for (const ub of userBooks) {
        const book = ub.books as any;
        if (book?.subjects) {
          for (const s of book.subjects) {
            subjectCounts[s] = (subjectCounts[s] || 0) + 1;
          }
        }
        if (book?.category) {
          categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
        }
      }

      const topSubjects = Object.entries(subjectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s]) => s);

      const topCategory = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // 3. Find books with overlapping subjects that user hasn't read
      if (topSubjects.length > 0) {
        const { data: suggested } = await supabase
          .from('books')
          .select('id, title, author, cover_url, category, subjects')
          .overlaps('subjects', topSubjects)
          .not('id', 'in', `(${readBookIds.join(',')})`)
          .order('rating', { ascending: false })
          .limit(8);

        if (suggested && suggested.length > 0) {
          return suggested.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            cover_url: b.cover_url || '',
            category: b.category || '',
            reason: `Because you enjoy ${topSubjects[0]}`,
          }));
        }
      }

      // 4. Fallback: same category, high rated
      if (topCategory) {
        const { data: catBooks } = await supabase
          .from('books')
          .select('id, title, author, cover_url, category')
          .eq('category', topCategory)
          .not('id', 'in', `(${readBookIds.join(',')})`)
          .order('rating', { ascending: false })
          .limit(6);

        if (catBooks && catBooks.length > 0) {
          return catBooks.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            cover_url: b.cover_url || '',
            category: b.category || '',
            reason: `Popular in ${topCategory}`,
          }));
        }
      }

      return this.getTrending();
    } catch (e) {
      console.error('Recommendation error:', e);
      return this.getTrending();
    }
  },

  async getTrending(): Promise<Recommendation[]> {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, cover_url, category')
      .order('demand_score', { ascending: false })
      .limit(8);

    return (data || []).map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      cover_url: b.cover_url || '',
      category: b.category || '',
      reason: 'Trending on AcademicOS',
    }));
  },
};

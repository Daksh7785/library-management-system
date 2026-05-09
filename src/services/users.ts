/**
 * AcademicOS — User Service
 * 
 * Handles profiles, user library (user_books), ratings, reviews,
 * search history, and reading stats. All connected to real Supabase tables.
 */

import { supabase } from '../lib/supabase';

export type ReadingStatus = 'reading' | 'completed' | 'wishlist' | 'dropped';

export interface UserBookEntry {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  progress_percentage: number;
  rating: number | null;
  review: string | null;
  notes: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  books?: {
    title: string;
    author: string;
    cover_url: string;
    category: string;
    subjects: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  xp: number;
  streak_days: number;
  reading_dna: Record<string, any>;
  created_at: string;
}

export const UserService = {
  // ── Profile ─────────────────────────────────────

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  // ── User Library (user_books) ───────────────────

  async getLibrary(userId: string, status?: ReadingStatus): Promise<UserBookEntry[]> {
    let query = supabase
      .from('user_books')
      .select('*, books(title, author, cover_url, category, subjects)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as UserBookEntry[];
  },

  async addToLibrary(userId: string, bookId: string, status: ReadingStatus = 'wishlist') {
    const { data, error } = await supabase
      .from('user_books')
      .upsert(
        {
          user_id: userId,
          book_id: bookId,
          status,
          started_at: status === 'reading' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(userId: string, bookId: string, status: ReadingStatus, progress?: number) {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'reading' && !progress) updates.started_at = new Date().toISOString();
    if (status === 'completed') {
      updates.finished_at = new Date().toISOString();
      updates.progress_percentage = 100;
    }
    if (progress !== undefined) updates.progress_percentage = progress;

    const { error } = await supabase
      .from('user_books')
      .update(updates)
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) throw error;
  },

  async rateBook(userId: string, bookId: string, rating: number, review?: string) {
    const updates: Record<string, any> = {
      rating,
      updated_at: new Date().toISOString(),
    };
    if (review !== undefined) updates.review = review;

    const { error } = await supabase
      .from('user_books')
      .update(updates)
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) throw error;

    // Update aggregate rating on the books table
    const { data: allRatings } = await supabase
      .from('user_books')
      .select('rating')
      .eq('book_id', bookId)
      .not('rating', 'is', null);

    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length;
      await supabase
        .from('books')
        .update({ rating: Math.round(avg * 100) / 100, ratings_count: allRatings.length })
        .eq('id', bookId);
    }
  },

  async removeFromLibrary(userId: string, bookId: string) {
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) throw error;
  },

  // ── Reading Stats (via RPC) ─────────────────────

  async getStats(userId: string) {
    const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: userId });
    if (error) {
      // Fallback: compute client-side
      const { data: ub } = await supabase
        .from('user_books')
        .select('status, rating')
        .eq('user_id', userId);

      const books = ub || [];
      return {
        books_reading: books.filter((b) => b.status === 'reading').length,
        books_completed: books.filter((b) => b.status === 'completed').length,
        books_wishlist: books.filter((b) => b.status === 'wishlist').length,
        total_interactions: books.length,
        avg_rating: 0,
        recent_books: [],
      };
    }
    return data;
  },

  // ── Search History ──────────────────────────────

  async getSearchHistory(userId: string, limit = 10) {
    const { data } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  },
};

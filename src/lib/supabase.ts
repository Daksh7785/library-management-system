import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'admin' | 'faculty';
  avatar_url: string | null;
  xp: number;
  streak_days: number;
  last_active: string | null;
  reading_dna: any;
  created_at: string;
};

export type Book = {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
  publisher: string | null;
  published_year: number | null;
  total_pages: number | null;
  language: string;
  tags: string[];
  demand_score: number;
  embedding: any;
  created_at: string;
  updated_at: string;
};

export type BookCopy = {
  id: string;
  book_id: string;
  qr_code: string;
  condition_score: number;
  status: 'available' | 'issued' | 'lost' | 'retired';
  location_shelf: string | null;
  acquired_date: string;
  parent_copy_id: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  copy_id: string;
  book_id: string;
  issued_at: string;
  due_at: string;
  returned_at: string | null;
  overdue_fine: number;
  condition_on_return: number | null;
  secret_message_encrypted: string | null;
  created_at: string;
};

export type Hold = {
  id: string;
  user_id: string;
  book_id: string;
  position: number;
  status: 'waiting' | 'ready' | 'fulfilled' | 'cancelled';
  notified_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type ReadingSession = {
  id: string;
  user_id: string;
  book_id: string;
  started_at: string;
  ended_at: string | null;
  pages_read: number;
  xp_earned: number;
  mood: string | null;
};

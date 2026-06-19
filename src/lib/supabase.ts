import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// The standard client
const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'admin' | 'faculty' | 'teacher';
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
  status: 'available' | 'issued' | 'lost' | 'retired' | 'maintenance';
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

// ==========================================
// MOCK DATABASE & CLIENT IMPLEMENTATION
// ==========================================

const MOCK_PROFILES = [
  { id: 'demo-student-id', email: 'student@demo.academic.com', full_name: 'Demo Student', name: 'Demo Student', role: 'student', xp: 1200, streak_days: 5, library_id: '1', max_limit: 3, created_at: new Date().toISOString() },
  { id: 'demo-teacher-id', email: 'teacher@demo.academic.com', full_name: 'Demo Teacher', name: 'Demo Teacher', role: 'teacher', xp: 2500, streak_days: 12, library_id: '1', max_limit: 10, created_at: new Date().toISOString() },
  { id: 'demo-admin-id', email: 'admin@demo.academic.com', full_name: 'System Admin', name: 'System Admin', role: 'admin', xp: 9999, streak_days: 42, library_id: '1', max_limit: 100, created_at: new Date().toISOString() }
];

const MOCK_BOOKS = [
  {
    id: 'book-1',
    library_id: '1',
    isbn: '9780131118928',
    title: 'Quantum Physics: A Modern Introduction',
    author: 'Dr. Elizabeth Vance',
    description: 'A comprehensive guide to quantum mechanics, wave-particle duality, and wave equations for advanced researchers.',
    cover_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
    category: 'Physics',
    rating: 4.8,
    reviews_count: 12,
    published_year: 2021,
    total_pages: 540,
    language: 'en',
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'book-2',
    library_id: '1',
    isbn: '9780262033848',
    title: 'Artificial Intelligence: Foundations & Agents',
    author: 'Prof. Arthur Pendelton',
    description: 'Explore the core algorithms of machine learning, neural architectures, and multi-agent system coordination.',
    cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    category: 'Computer Science',
    rating: 4.9,
    reviews_count: 38,
    published_year: 2023,
    total_pages: 820,
    language: 'en',
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'book-3',
    library_id: '1',
    isbn: '9780262033849',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    description: 'The standard textbook on algorithms, data structures, complexity theory, and graph analysis.',
    cover_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80',
    category: 'Computer Science',
    rating: 4.7,
    reviews_count: 56,
    published_year: 2009,
    total_pages: 1292,
    language: 'en',
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'book-4',
    library_id: '1',
    isbn: '9780393979855',
    title: 'Macroeconomic Policy and Financial Stability',
    author: 'Sarah Jenkins, PhD',
    description: 'An analysis of global monetary systems, central banking reserves, inflation factors, and fiscal recovery.',
    cover_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80',
    category: 'Economics',
    rating: 4.5,
    reviews_count: 8,
    published_year: 2018,
    total_pages: 410,
    language: 'en',
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'book-5',
    library_id: '1',
    isbn: '9780815341054',
    title: 'Genomics, Proteomics, and the Thread of Life',
    author: 'Dr. Marcus Thorne',
    description: 'Discover molecular genetics, RNA transcription, and the computational algorithms driving evolutionary bioinformatics.',
    cover_url: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=400&q=80',
    category: 'Biology',
    rating: 4.7,
    reviews_count: 15,
    published_year: 2022,
    total_pages: 680,
    language: 'en',
    available: true,
    created_at: new Date().toISOString()
  }
];

const MOCK_COPIES = [
  { id: 'copy-1-1', library_id: '1', book_id: 'book-1', status: 'available', condition_score: 95, condition: 'Excellent', total_readers: 4, rescue_count: 0, longest_journey: '2 months', created_at: new Date().toISOString() },
  { id: 'copy-1-2', library_id: '1', book_id: 'book-1', status: 'issued', condition_score: 80, condition: 'Good', total_readers: 9, rescue_count: 1, longest_journey: '6 months', created_at: new Date().toISOString() },
  { id: 'copy-2-1', library_id: '1', book_id: 'book-2', status: 'available', condition_score: 98, condition: 'Mint', total_readers: 2, rescue_count: 0, longest_journey: '1 month', created_at: new Date().toISOString() },
  { id: 'copy-3-1', library_id: '1', book_id: 'book-3', status: 'available', condition_score: 90, condition: 'Very Good', total_readers: 7, rescue_count: 2, longest_journey: '3 months', created_at: new Date().toISOString() },
  { id: 'copy-4-1', library_id: '1', book_id: 'book-4', status: 'available', condition_score: 92, condition: 'Excellent', total_readers: 5, rescue_count: 0, longest_journey: '4 months', created_at: new Date().toISOString() }
];

const MOCK_QR = [
  { id: 'qr-1', book_copy_id: 'copy-1-1', qr_token: 'QR-PHY-001', sticker_printed: true, public_url: 'http://localhost:5173/copy/QR-PHY-001', created_at: new Date().toISOString() },
  { id: 'qr-2', book_copy_id: 'copy-1-2', qr_token: 'QR-PHY-002', sticker_printed: true, public_url: 'http://localhost:5173/copy/QR-PHY-002', created_at: new Date().toISOString() },
  { id: 'qr-3', book_copy_id: 'copy-2-1', qr_token: 'QR-CS-001', sticker_printed: true, public_url: 'http://localhost:5173/copy/QR-CS-001', created_at: new Date().toISOString() }
];

const MOCK_COURSES = [
  { id: 'course-1', library_id: '1', code: 'CS-101', title: 'Introduction to Artificial Intelligence', description: 'Deep dive into neural networks, decision trees, search strategies, and reinforcement learning.', syllabus: {}, teacher_id: 'demo-teacher-id', created_at: new Date().toISOString() },
  { id: 'course-2', library_id: '1', code: 'PHY-201', title: 'Modern Quantum Theory', description: 'Explores mechanical states, Schrodinger wave packets, quantum tunnelling, and spin properties.', syllabus: {}, teacher_id: 'demo-teacher-id', created_at: new Date().toISOString() }
];

const MOCK_TOPICS = [
  { id: 'topic-1', name: 'Quantum Mechanics', description: 'Theoretical study of particles at subatomic scale.' },
  { id: 'topic-2', name: 'Machine Learning', description: 'Subfield of AI focusing on training agents from data.' },
  { id: 'topic-3', name: 'Macroeconomics', description: 'National and global financial stability research.' }
];

const MOCK_SKILLS = [
  { id: 'skill-1', topic_id: 'topic-2', name: 'Supervised Learning', level: 'Beginner' },
  { id: 'skill-2', topic_id: 'topic-2', name: 'Neural Networks', level: 'Advanced' }
];

// In-memory local storage helper that keeps state synced
const initLocalData = () => {
  const checkOrInit = (key: string, defaultVal: any) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
    }
  };
  checkOrInit('profiles', MOCK_PROFILES);
  checkOrInit('books', MOCK_BOOKS);
  checkOrInit('book_copies', MOCK_COPIES);
  checkOrInit('copy_qr', MOCK_QR);
  checkOrInit('courses', MOCK_COURSES);
  checkOrInit('topics', MOCK_TOPICS);
  checkOrInit('skills', MOCK_SKILLS);
  checkOrInit('book_topics', []);
  checkOrInit('transactions', []);
  checkOrInit('copy_timeline', []);
  checkOrInit('user_stats', [{ user_id: 'demo-student-id', library_id: '1', total_points: 1200, reading_streak: 5, books_read: 3, updated_at: new Date().toISOString() }]);
  checkOrInit('study_sessions', []);
  checkOrInit('peer_matches', []);
  checkOrInit('resources', []);
  checkOrInit('media_content', []);
  checkOrInit('content_progress', []);
  checkOrInit('ai_alerts', []);
  checkOrInit('book_usage_logs', []);
  checkOrInit('enrollments', []);
};

if (typeof window !== 'undefined') {
  initLocalData();
}

const getLocalData = (key: string): any[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const saveLocalData = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Builder to simulate Supabase Query Builders
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol?: string;
  private orderAsc = true;
  private limitCount?: number;
  private isSingle = false;
  private actionType: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private actionValues: any = null;
  private actionOptions: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string, options?: any) {
    // Chained select method
    return this;
  }

  range(from: number, to: number) {
    // Simply returns this. Supported for pagination chaining.
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(item => {
      if (column === 'id' && item.id === value) return true;
      if (column === 'user_id' && item.user_id === value) return true;
      if (column === 'book_id' && item.book_id === value) return true;
      if (column === 'book_copy_id' && item.book_copy_id === value) return true;
      if (column === 'library_id' && item.library_id === value) return true;
      if (column === 'qr_token' && item.qr_token === value) return true;
      if (column === 'uploaded_by' && item.uploaded_by === value) return true;
      if (column === 'target_user' && item.target_user === value) return true;
      if (column === 'content_id' && item.content_id === value) return true;
      if (column === 'status' && item.status === value) return true;
      if (item[column] === value) return true;
      return false;
    });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(item => item[column] !== value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push(item => item[column] < value);
    return this;
  }

  or(filterStr: string) {
    this.filters.push(item => {
      const parts = filterStr.split(',');
      return parts.some(part => {
        const [col, cond, val] = part.split('.');
        const cleanVal = (val || '').replace(/%/g, '').toLowerCase();
        if (cond === 'ilike' && item[col]) {
          return String(item[col]).toLowerCase().includes(cleanVal);
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(values: any) {
    this.actionType = 'insert';
    this.actionValues = values;
    return this;
  }

  update(values: any) {
    this.actionType = 'update';
    this.actionValues = values;
    return this;
  }

  upsert(values: any, options?: { onConflict: string }) {
    this.actionType = 'upsert';
    this.actionValues = values;
    this.actionOptions = options;
    return this;
  }

  delete() {
    this.actionType = 'delete';
    return this;
  }

  // Promise-like then method so we can await builders directly
  async then(resolve: any, reject: any) {
    try {
      let resultData: any = null;

      if (this.actionType === 'insert') {
        const data = getLocalData(this.tableName);
        const newItems = Array.isArray(this.actionValues) ? this.actionValues : [this.actionValues];
        const createdItems = newItems.map(item => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        }));
        saveLocalData(this.tableName, [...data, ...createdItems]);
        resultData = this.isSingle || !Array.isArray(this.actionValues) ? createdItems[0] : createdItems;
      } else if (this.actionType === 'update') {
        const data = getLocalData(this.tableName);
        let updated: any[] = [];
        const updatedData = data.map(item => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          if (matches) {
            const newItem = { ...item, ...this.actionValues, updated_at: new Date().toISOString() };
            updated.push(newItem);
            return newItem;
          }
          return item;
        });
        saveLocalData(this.tableName, updatedData);
        resultData = this.isSingle ? updated[0] : updated;
      } else if (this.actionType === 'upsert') {
        const data = getLocalData(this.tableName);
        const inputItems = Array.isArray(this.actionValues) ? this.actionValues : [this.actionValues];
        let updatedData = [...data];
        const conflictKeys = this.actionOptions?.onConflict ? this.actionOptions.onConflict.split(',') : ['id'];

        inputItems.forEach(input => {
          const matchIdx = updatedData.findIndex(item => 
            conflictKeys.every(k => item[k.trim()] === input[k.trim()])
          );
          if (matchIdx >= 0) {
            updatedData[matchIdx] = { ...updatedData[matchIdx], ...input, updated_at: new Date().toISOString() };
          } else {
            updatedData.push({
              id: input.id || Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...input
            });
          }
        });
        saveLocalData(this.tableName, updatedData);
        resultData = this.isSingle || !Array.isArray(this.actionValues) ? inputItems[0] : inputItems;
      } else if (this.actionType === 'delete') {
        const data = getLocalData(this.tableName);
        const remaining = data.filter(item => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          return !matches;
        });
        saveLocalData(this.tableName, remaining);
        resultData = [];
      } else {
        // select
        let data = getLocalData(this.tableName);
        let filtered = data.filter(item => {
          for (const filter of this.filters) {
            if (!filter(item)) return false;
          }
          return true;
        });

        // Joint mapping simulations for complex front-end joins
        if (this.tableName === 'book_copies') {
          const books = getLocalData('books');
          const qrs = getLocalData('copy_qr');
          filtered = filtered.map(c => ({
            ...c,
            books: books.find(b => b.id === c.book_id),
            copy_qr: qrs.filter(q => q.book_copy_id === c.id)
          }));
        } else if (this.tableName === 'transactions') {
          const copies = getLocalData('book_copies');
          const books = getLocalData('books');
          const profiles = getLocalData('profiles');
          filtered = filtered.map(t => {
            const copy = copies.find(c => c.id === t.book_copy_id || c.id === t.copy_id);
            if (copy) {
              copy.books = books.find(b => b.id === copy.book_id);
            }
            return {
              ...t,
              book_copies: copy,
              profiles: profiles.find(p => p.id === t.user_id)
            };
          });
        } else if (this.tableName === 'courses') {
          const profiles = getLocalData('profiles');
          filtered = filtered.map(c => ({
            ...c,
            teacher: profiles.find(p => p.id === c.teacher_id)
          }));
        } else if (this.tableName === 'enrollments') {
          const courses = getLocalData('courses');
          filtered = filtered.map(e => ({
            ...e,
            course: courses.find(c => c.id === e.course_id)
          }));
        } else if (this.tableName === 'knowledge_passport') {
          const profiles = getLocalData('profiles');
          filtered = filtered.map(kp => ({
            ...kp,
            profiles: profiles.find(p => p.id === kp.user_id)
          }));
        } else if (this.tableName === 'study_sessions') {
          const books = getLocalData('books');
          filtered = filtered.map(s => ({
            ...s,
            books: books.find(b => b.id === s.book_id)
          }));
        }

        if (this.orderCol) {
          filtered.sort((a, b) => {
            const valA = a[this.orderCol!];
            const valB = b[this.orderCol!];
            if (valA < valB) return this.orderAsc ? -1 : 1;
            if (valA > valB) return this.orderAsc ? 1 : -1;
            return 0;
          });
        }

        if (this.limitCount) {
          filtered = filtered.slice(0, this.limitCount);
        }

        resultData = filtered;
      }

      const count = Array.isArray(resultData) ? resultData.length : 0;
      if (this.isSingle) {
        return resolve({ data: Array.isArray(resultData) ? (resultData[0] || null) : resultData, error: null, count });
      }

      return resolve({ data: resultData, error: null, count });
    } catch (e: any) {
      return reject({ data: null, error: e });
    }
  }
}

// In-memory simulation of Auth
let currentSession: any = null;
const authListeners = new Set<(event: string, session: any) => void>();

const mockAuth = {
  async getSession() {
    const localSession = localStorage.getItem('demo_session');
    currentSession = localSession ? JSON.parse(localSession) : null;
    return { data: { session: currentSession }, error: null };
  },
  async getUser() {
    const localSession = localStorage.getItem('demo_session');
    const session = localSession ? JSON.parse(localSession) : null;
    return { data: { user: session?.user || null }, error: null };
  },
  async signInWithPassword({ email }: { email: string }) {
    const profiles = getLocalData('profiles');
    const profile = profiles.find(p => p.email === email) || profiles[0];
    const session = {
      access_token: 'mock-jwt-token',
      user: {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        user_metadata: { name: profile.name, full_name: profile.full_name }
      }
    };
    currentSession = session;
    localStorage.setItem('demo_session', JSON.stringify(session));
    authListeners.forEach(listener => listener('SIGNED_IN', session));
    return { data: session, error: null };
  },
  async signUp({ email, options }: any) {
    const name = options?.data?.name || 'New Scholar';
    const profile = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      full_name: name,
      role: 'student',
      xp: 0,
      streak_days: 1,
      library_id: '1',
      max_limit: 3,
      created_at: new Date().toISOString()
    };
    const profiles = getLocalData('profiles');
    saveLocalData('profiles', [...profiles, profile]);

    const session = {
      access_token: 'mock-jwt-token',
      user: {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        user_metadata: { name: profile.name, full_name: profile.full_name }
      }
    };
    currentSession = session;
    localStorage.setItem('demo_session', JSON.stringify(session));
    authListeners.forEach(listener => listener('SIGNED_IN', session));
    return { data: session, error: null };
  },
  async signOut() {
    currentSession = null;
    localStorage.removeItem('demo_session');
    authListeners.forEach(listener => listener('SIGNED_OUT', null));
    return { error: null };
  },
  onAuthStateChange(callback: any) {
    authListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
  },
  async updateUser({ password }: any) {
    return { data: { user: currentSession?.user }, error: null };
  },
  async resetPasswordForEmail(email: string, options: any) {
    return { data: {}, error: null };
  }
};

const mockStorage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File) {
        return { data: { path }, error: null };
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: 'https://images.unsplash.com/photo-1543005120-a1bb3ea79e9c?q=80&w=800' } };
      }
    };
  }
};

// RPC simulations
const handleRpc = async (fnName: string, args: any) => {
  if (fnName === 'issue_book_rpc') {
    const { p_user_id, p_book_id } = args;
    const copies = getLocalData('book_copies');
    const copy = copies.find(c => c.book_id === p_book_id && c.status === 'available');
    if (!copy) {
      return { data: { success: false, error: 'No copies available' }, error: null };
    }

    copy.status = 'issued';
    saveLocalData('book_copies', copies);

    const tx = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: p_user_id,
      library_id: '1',
      book_copy_id: copy.id,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'issued',
      fine: 0
    };
    const txs = getLocalData('transactions');
    saveLocalData('transactions', [...txs, tx]);

    const timeline = getLocalData('copy_timeline');
    saveLocalData('copy_timeline', [...timeline, {
      id: Math.random().toString(36).substr(2, 9),
      library_id: '1',
      book_copy_id: copy.id,
      user_id: p_user_id,
      event_type: 'CHECKED_OUT',
      note: 'Book copy issued successfully.',
      is_anonymous: false,
      created_at: new Date().toISOString()
    }]);

    return { data: { success: true }, error: null };
  }

  if (fnName === 'increment') {
    return { data: 1, error: null };
  }

  return { data: null, error: null };
};

// Detect if we should use mock client or real supabase client
const isMockMode = () => {
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('aifvxjxuvsfaanbmyaet');
  return isPlaceholder;
};

// Create the dynamic proxy for supabase client
export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    if (isMockMode()) {
      if (prop === 'from') {
        return (table: string) => new MockQueryBuilder(table);
      }
      if (prop === 'auth') {
        return mockAuth;
      }
      if (prop === 'storage') {
        return mockStorage;
      }
      if (prop === 'rpc') {
        return handleRpc;
      }
    }
    return Reflect.get(target, prop, receiver);
  }
}) as any;

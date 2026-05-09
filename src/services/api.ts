import type { 
  Book, BookCopy, Course, Enrollment, Topic, Skill, 
  UserStats, Library, CopyTimelineEvent, CopyQR, ReadingNote,
  KnowledgePassport, BookPersonality, HeatmapPoint,
  PeerMatch, StudySession, Resource, AIAlert
} from '../types';
export type { ReadingNote };
import { supabase } from '../lib/supabase';

// Helper to map DB book to Book type
const mapBook = (db: any): Book => ({
  id: db.id,
  libraryId: db.library_id,
  title: db.title,
  author: db.author,
  isbn: db.isbn,
  description: db.description,
  createdAt: db.created_at,
  // UI extensions (mapping from legacy or defaults)
  coverUrl: db.cover_url || `https://images.unsplash.com/photo-1543005120-a1bb3ea79e9c?q=80&w=800`,
  category: db.category || 'Academic',
  rating: Number(db.rating || 4.5),
  reviewsCount: db.reviews_count || 0,
  available: db.available !== undefined ? db.available : true
});

const mapCopy = (db: any): BookCopy => ({
  id: db.id,
  libraryId: db.library_id,
  bookId: db.book_id,
  status: db.status,
  condition: db.condition,
  conditionScore: db.condition_score,
  rescueCount: db.rescue_count,
  totalReaders: db.total_readers,
  longestJourney: db.longest_journey,
  createdAt: db.created_at
});

// --- Institution Services ---
export const fetchLibrary = async (id: string): Promise<Library | undefined> => {
  const { data, error } = await supabase.from('libraries').select('*').eq('id', id).single();
  if (error) return undefined;
  return { id: data.id, name: data.name, domain: data.domain, branding: data.branding, timezone: data.timezone, createdAt: data.created_at };
};

// --- Book Services ---
export const fetchBooks = async (libraryId?: string): Promise<Book[]> => {
  let query = supabase.from('books').select('*').order('title');
  if (libraryId) query = query.eq('library_id', libraryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapBook);
};

export const fetchBookById = async (id: string): Promise<Book | undefined> => {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
  if (error) return undefined;
  return mapBook(data);
};

export const issueBook = async (userId: string, bookId: string): Promise<void> => {
  const { data, error } = await supabase.rpc('issue_book_rpc', { p_user_id: userId, p_book_id: bookId });
  if (error) throw error;
  if (data && !data.success) throw new Error(data.error);
};

export const fetchUserTransactions = async (userId: string) => {
  const { data, error } = await supabase.from('transactions').select('*, book_copies(books(*))').eq('user_id', userId).order('issue_date', { ascending: false });
  if (error) throw error;
  return (data || []).map((t: any) => ({
    id: t.id, 
    userId: t.user_id,
    libraryId: t.library_id,
    bookCopyId: t.book_copy_id,
    issueDate: t.issue_date, 
    dueDate: t.due_date, 
    returnDate: t.return_date,
    status: t.status, 
    fine: Number(t.fine),
    book: t.book_copies?.books ? mapBook(t.book_copies.books) : null,
    title: t.book_copies?.books?.title || 'Unknown'
  }));
};

export const fetchAllTransactions = async (libraryId?: string) => {
  let query = supabase.from('transactions').select('*, book_copies(books(*)), profiles(name)').order('issue_date', { ascending: false });
  if (libraryId) query = query.eq('library_id', libraryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((t: any) => ({
    id: t.id, 
    patron: t.profiles?.name || 'Unknown User',
    status: t.status,
    title: t.book_copies?.books?.title || 'Unknown',
    issueDate: t.issue_date,
    dueDate: t.due_date,
    returnDate: t.return_date
  }));
};

// --- Academic LMS Services ---

export const fetchCourses = async (libraryId?: string): Promise<Course[]> => {
  let query = supabase.from('courses').select('*, teacher:profiles(name)');
  if (libraryId) query = query.eq('library_id', libraryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id, libraryId: c.library_id, code: c.code, title: c.title,
    description: c.description, syllabus: c.syllabus, teacherId: c.teacher_id,
    createdAt: c.created_at, teacher: c.teacher
  }));
};

export const enrollInCourse = async (courseId: string, userId: string, libraryId: string): Promise<void> => {
  const { error } = await supabase.from('enrollments').insert({ course_id: courseId, user_id: userId, library_id: libraryId });
  if (error) throw error;
};

export const fetchStudentEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const { data, error } = await supabase.from('enrollments').select('*, course:courses(*)').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((e: any) => ({
    id: e.id, libraryId: e.library_id, userId: e.user_id, courseId: e.course_id, 
    progressPercentage: Number(e.progress_percentage), createdAt: e.created_at, course: e.course
  }));
};

// --- Knowledge Graph ---

export const fetchGraphData = async (): Promise<{ topics: Topic[], skills: Skill[], relations: any[] }> => {
  const { data: topics } = await supabase.from('topics').select('*');
  const { data: skills } = await supabase.from('skills').select('*');
  const { data: relations } = await supabase.from('book_topics').select('*, book:books(title)');
  return { 
    topics: (topics || []).map(t => ({ id: t.id, name: t.name, description: t.description })), 
    skills: (skills || []).map(s => ({ id: s.id, topicId: s.topic_id, name: s.name, level: s.level })), 
    relations: relations || [] 
  };
};

// --- Living ISBN Services ---

export const addTimelineEvent = async (event: Omit<CopyTimelineEvent, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase.from('copy_timeline').insert({
    library_id: event.libraryId,
    book_copy_id: event.bookCopyId,
    user_id: event.userId,
    event_type: event.eventType,
    note: event.note,
    is_anonymous: event.isAnonymous,
    location_tag: event.locationTag
  }).select().single();
  if (error) throw error;
  return data;
};

export const fetchBookCopies = async (bookId: string): Promise<BookCopy[]> => {
  const { data, error } = await supabase.from('book_copies').select('*').eq('book_id', bookId);
  if (error) throw error;
  return (data || []).map(mapCopy);
};

export const fetchTimeline = async (copyId: string): Promise<CopyTimelineEvent[]> => {
  const { data, error } = await supabase.from('copy_timeline').select('*').eq('book_copy_id', copyId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(e => ({ 
    id: e.id, libraryId: e.library_id, bookCopyId: e.book_copy_id, userId: e.user_id, 
    eventType: e.event_type, note: e.note, isAnonymous: e.is_anonymous, 
    locationTag: e.location_tag, createdAt: e.created_at 
  }));
};

export const fetchCopyByToken = async (qrToken: string): Promise<{ book: Book; copy: BookCopy; timeline: CopyTimelineEvent[] } | undefined> => {
  const { data: qr, error: qrError } = await supabase.from('copy_qr').select('*').eq('qr_token', qrToken).single();
  if (qrError || !qr) return undefined;
  const { data: copy, error: copyError } = await supabase.from('book_copies').select('*, books(*)').eq('id', qr.book_copy_id).single();
  if (copyError || !copy) return undefined;
  const timeline = await fetchTimeline(copy.id);
  return { book: mapBook(copy.books), copy: mapCopy(copy), timeline };
};

// --- User Stats ---

export const fetchUserStats = async (userId: string): Promise<UserStats | undefined> => {
  const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();
  if (error) return undefined;
  return { userId: data.user_id, libraryId: data.library_id, totalPoints: data.total_points, readingStreak: data.reading_streak, booksRead: data.books_read, updatedAt: data.updated_at };
};

// --- Collaboration & Rooms ---

export const fetchActiveRooms = async () => {
  const { data, error } = await supabase.from('reading_rooms').select('*').eq('status', 'active');
  if (error) {
    // Fallback if table doesn't exist yet or is empty
    return [];
  }
  return data || [];
};

// --- Search & UI ---

export const semanticSearch = async (query: string): Promise<Book[]> => {
  const { data, error } = await supabase.from('books').select('*').or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
  if (error) throw error;
  return (data || []).map(mapBook);
};

export const returnBook = async (transactionId: string): Promise<void> => {
  const { error } = await supabase.from('transactions').update({ 
    status: 'returned', 
    return_date: new Date().toISOString() 
  }).eq('id', transactionId);
  if (error) throw error;
};

export const fetchMarketplaceListings = async (_libraryId?: string) => {
  // Return empty array for now or real logic if table exists
  return [];
};

export const getRecommendations = async (limit: number = 4): Promise<Book[]> => {
  const { data, error } = await supabase.from('books').select('*').limit(limit);
  if (error) throw error;
  return (data || []).map(mapBook);
};

export const trackViewedBook = async (_bookId: string) => {
  // Placeholder for analytics
};

export const getSimilarBooks = async (_bookId: string, limit: number = 4): Promise<Book[]> => {
  return getRecommendations(limit);
};

export const fetchBookNotes = async (_bookId: string): Promise<ReadingNote[]> => {
  // Fallback to local or empty
  return [];
};

export const addNote = async (bookId: string, userName: string, content: string): Promise<ReadingNote> => {
  const note: ReadingNote = {
    id: Math.random().toString(36).substr(2, 9),
    bookId,
    userName,
    content,
    createdAt: new Date().toISOString()
  };
  return note;
};

export const generateCopyQR = async (copyId: string): Promise<CopyQR> => {
  const token = Math.random().toString(36).substr(2, 12).toUpperCase();
  const { data, error } = await supabase.from('copy_qr').insert({
    book_copy_id: copyId,
    qr_token: token,
    public_url: `${window.location.origin}/copy/${token}`
  }).select().single();
  if (error) throw error;
  return { 
    id: data.id, bookCopyId: data.book_copy_id, qrToken: data.qr_token, 
    publicUrl: data.public_url, stickerPrinted: data.sticker_printed, 
    createdAt: data.created_at 
  };
};

export const markStickerPrinted = async (qrId: string): Promise<void> => {
  const { error } = await supabase.from('copy_qr').update({ sticker_printed: true }).eq('id', qrId);
  if (error) throw error;
};

export const addBook = async (book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
  const { data, error } = await supabase.from('books').insert({
    library_id: book.libraryId,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    description: book.description,
    category: book.category,
    publisher: book.publisher
  }).select().single();
  if (error) throw error;
  return mapBook(data);
};

export const fetchAllCopies = async (libraryId?: string): Promise<any[]> => {
  let query = supabase.from('book_copies').select('*, books(title), copy_qr(id)');
  if (libraryId) query = query.eq('library_id', libraryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(c => ({
    ...mapCopy(c),
    bookTitle: c.books?.title || 'Unknown',
    qrStatus: !!c.copy_qr?.length // Simplified: true if any QR exists
  }));
};

export const uploadBookCover = async (file: File): Promise<string> => {
  const fileName = `${Math.random().toString(36).substr(2, 9)}-${file.name}`;
  const { data, error } = await supabase.storage.from('book-covers').upload(fileName, file);
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from('book-covers').getPublicUrl(data.path);
  return publicUrl.publicUrl;
};

export const logoutUser = async () => { await supabase.auth.signOut(); };

// ============================================================
// NEXT-GEN FEATURE SERVICES
// ============================================================

// ── 1. KNOWLEDGE PASSPORT ─────────────────────────────────
export const fetchPassport = async (userId: string): Promise<KnowledgePassport | null> => {
  const { data, error } = await supabase
    .from('knowledge_passport').select('*').eq('user_id', userId).single();
  if (error) return null;
  return {
    id: data.id, userId: data.user_id, libraryId: data.library_id,
    globalScore: data.global_score, skills: data.skills || [],
    achievements: data.achievements || [], booksRead: data.books_read,
    coursesDone: data.courses_done, public: data.public, updatedAt: data.updated_at
  };
};

export const upsertPassport = async (
  userId: string, libraryId: string,
  patch: Partial<{ globalScore: number; skills: string[]; achievements: any[]; booksRead: number; coursesDone: number; }>
): Promise<void> => {
  const { error } = await supabase.from('knowledge_passport').upsert({
    user_id: userId, library_id: libraryId,
    global_score: patch.globalScore, skills: patch.skills,
    achievements: patch.achievements, books_read: patch.booksRead,
    courses_done: patch.coursesDone, updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  if (error) throw error;
};

export const fetchLeaderboard = async (libraryId?: string): Promise<KnowledgePassport[]> => {
  let q = supabase.from('knowledge_passport').select('*, profiles(name, avatar_url, email)')
    .order('global_score', { ascending: false }).limit(20);
  if (libraryId) q = q.eq('library_id', libraryId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(d => ({
    id: d.id, userId: d.user_id, libraryId: d.library_id,
    globalScore: d.global_score, skills: d.skills || [],
    achievements: d.achievements || [], booksRead: d.books_read,
    coursesDone: d.courses_done, public: d.public, updatedAt: d.updated_at,
    profile: d.profiles ? { name: d.profiles.name, avatarUrl: d.profiles.avatar_url, email: d.profiles.email } : undefined
  }));
};

// ── 2. BOOK PERSONALITY ENGINE ────────────────────────────
export const fetchBookPersonality = async (bookId: string): Promise<BookPersonality | null> => {
  const { data, error } = await supabase
    .from('book_personality').select('*').eq('book_id', bookId).single();
  if (error) return null;
  return {
    id: data.id, bookId: data.book_id, libraryId: data.library_id,
    difficultyLevel: data.difficulty_level, sentimentScore: Number(data.sentiment_score),
    engagementScore: Number(data.engagement_score), completionRate: Number(data.completion_rate),
    personalityTags: data.personality_tags || [], totalNotes: data.total_notes,
    lastAnalyzedAt: data.last_analyzed_at
  };
};

export const analyzeBookPersonality = async (bookId: string, libraryId: string): Promise<BookPersonality> => {
  // Fetch notes count for this book
  const { count: notesCount } = await supabase.from('copy_timeline')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'ANNOTATED');

  // Simulate an ML-style analysis with rule-based heuristics
  const sentiment = 0.4 + Math.random() * 0.5;
  const engagement = 0.3 + Math.random() * 0.6;
  const tags: string[] = [];
  if (engagement > 0.7) tags.push('Trending');
  if (sentiment > 0.7) tags.push('Motivational');
  if (engagement < 0.4) tags.push('Niche');
  tags.push(engagement > 0.6 ? 'Exam-Focused' : 'Exploratory');

  const personality = {
    book_id: bookId, library_id: libraryId,
    difficulty_level: engagement > 0.7 ? 'advanced' : sentiment > 0.6 ? 'intermediate' : 'beginner',
    sentiment_score: sentiment, engagement_score: engagement,
    completion_rate: 0.5 + Math.random() * 0.4,
    personality_tags: tags, total_notes: notesCount || 0,
    last_analyzed_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('book_personality').upsert(personality, { onConflict: 'book_id' }).select().single();
  if (error) throw error;
  return {
    id: data.id, bookId: data.book_id, libraryId: data.library_id,
    difficultyLevel: data.difficulty_level as any, sentimentScore: Number(data.sentiment_score),
    engagementScore: Number(data.engagement_score), completionRate: Number(data.completion_rate),
    personalityTags: data.personality_tags || [], totalNotes: data.total_notes,
    lastAnalyzedAt: data.last_analyzed_at
  };
};

// ── 3. LIVE BOOK HEATMAP ──────────────────────────────────
export const logBookUsage = async (
  bookId: string, userId: string, libraryId: string,
  action: 'view' | 'borrow' | 'search' = 'view'
): Promise<void> => {
  // Attempt to get a rough location via free IP API (non-critical)
  const location = 'Global'; // fallback — can be enriched
  await supabase.from('book_usage_logs').insert({
    book_id: bookId, user_id: userId, library_id: libraryId,
    location, action
  });
};

export const fetchHeatmapData = async (): Promise<HeatmapPoint[]> => {
  const { data, error } = await supabase
    .from('book_usage_logs')
    .select('location, lat, lng, book_id')
    .not('location', 'is', null);
  if (error) return [];

  // Aggregate by location
  const map: Record<string, HeatmapPoint> = {};
  (data || []).forEach(row => {
    const key = row.location;
    if (!map[key]) map[key] = { location: key, lat: row.lat || 0, lng: row.lng || 0, count: 0, books: [] };
    map[key].count++;
    if (row.book_id && !map[key].books.includes(row.book_id)) map[key].books.push(row.book_id);
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
};

export const fetchTrendingByRegion = async (): Promise<{ location: string; count: number }[]> => {
  const { data, error } = await supabase
    .from('book_usage_logs').select('location').not('location', 'is', null);
  if (error) return [];
  const counts: Record<string, number> = {};
  (data || []).forEach(r => { counts[r.location] = (counts[r.location] || 0) + 1; });
  return Object.entries(counts).map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count).slice(0, 10);
};

// ── 4. PEER LEARNING MATCHMAKING ──────────────────────────
export const fetchMyMatches = async (userId: string): Promise<PeerMatch[]> => {
  const { data, error } = await supabase
    .from('peer_matches')
    .select('*, peer:profiles!peer_matches_user2_id_fkey(name, avatar_url, email, role)')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .neq('status', 'dismissed')
    .order('match_score', { ascending: false });
  if (error) return [];
  return (data || []).map(d => ({
    id: d.id, libraryId: d.library_id, user1Id: d.user1_id, user2Id: d.user2_id,
    matchScore: Number(d.match_score), commonBooks: d.common_books || [],
    commonTopics: d.common_topics || [], status: d.status, createdAt: d.created_at,
    peer: d.peer
  }));
};

export const generatePeerMatches = async (userId: string, libraryId: string): Promise<PeerMatch[]> => {
  // Fetch this user's transactions to get read books
  const { data: myTx } = await supabase.from('transactions')
    .select('book_copy_id, book_copies(book_id)').eq('user_id', userId);
  const myBooks = (myTx || []).map((t: any) => t.book_copies?.book_id).filter(Boolean);

  // Fetch other users in same library
  const { data: others } = await supabase.from('profiles')
    .select('id, name, email, role').eq('library_id', libraryId).neq('id', userId).limit(20);

  const matches: PeerMatch[] = [];
  for (const other of (others || [])) {
    const { data: otherTx } = await supabase.from('transactions')
      .select('book_copy_id, book_copies(book_id)').eq('user_id', other.id);
    const theirBooks = (otherTx || []).map((t: any) => t.book_copies?.book_id).filter(Boolean);
    const common = myBooks.filter(b => theirBooks.includes(b));
    if (common.length === 0) continue;
    const score = Math.min(100, Math.round((common.length / Math.max(myBooks.length, 1)) * 100));

    await supabase.from('peer_matches').upsert({
      library_id: libraryId, user1_id: userId, user2_id: other.id,
      match_score: score, common_books: common, common_topics: [], status: 'suggested'
    }, { onConflict: 'user1_id,user2_id' });

    matches.push({
      id: `${userId}-${other.id}`, libraryId, user1Id: userId, user2Id: other.id,
      matchScore: score, commonBooks: common, commonTopics: [], status: 'suggested',
      createdAt: new Date().toISOString(),
      peer: { name: other.name, email: other.email, role: other.role }
    });
  }
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

export const updateMatchStatus = async (matchId: string, status: 'connected' | 'dismissed'): Promise<void> => {
  const { error } = await supabase.from('peer_matches').update({ status }).eq('id', matchId);
  if (error) throw error;
};

// ── 5. SMART STUDY MODE ───────────────────────────────────
export const fetchStudySessions = async (userId: string): Promise<StudySession[]> => {
  const { data, error } = await supabase
    .from('study_sessions').select('*, books(title, cover_url, author)')
    .eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) return [];
  return (data || []).map(d => ({
    id: d.id, userId: d.user_id, bookId: d.book_id, libraryId: d.library_id,
    title: d.title, totalChapters: d.total_chapters, chaptersDone: d.chapters_done,
    progressPct: Number(d.progress_pct), notes: d.notes || [], checkpoints: d.checkpoints || [],
    status: d.status, startedAt: d.started_at, updatedAt: d.updated_at,
    book: d.books ? { title: d.books.title, coverUrl: d.books.cover_url, author: d.books.author } : undefined
  }));
};

export const createStudySession = async (
  userId: string, bookId: string, libraryId: string, title: string, totalChapters: number
): Promise<StudySession> => {
  const { data, error } = await supabase.from('study_sessions').insert({
    user_id: userId, book_id: bookId, library_id: libraryId,
    title, total_chapters: totalChapters, chapters_done: 0, progress_pct: 0
  }).select().single();
  if (error) throw error;
  return {
    id: data.id, userId: data.user_id, bookId: data.book_id, libraryId: data.library_id,
    title: data.title, totalChapters: data.total_chapters, chaptersDone: data.chapters_done,
    progressPct: 0, notes: [], checkpoints: [], status: data.status,
    startedAt: data.started_at, updatedAt: data.updated_at
  };
};

export const updateStudyProgress = async (
  sessionId: string, chaptersDone: number, totalChapters: number,
  notes: any[] = [], checkpoints: any[] = []
): Promise<void> => {
  const pct = Math.round((chaptersDone / totalChapters) * 100);
  const status = pct >= 100 ? 'completed' : 'active';
  const { error } = await supabase.from('study_sessions').update({
    chapters_done: chaptersDone, progress_pct: pct, notes, checkpoints,
    status, updated_at: new Date().toISOString()
  }).eq('id', sessionId);
  if (error) throw error;
};

// ── 6. UNIVERSAL RESOURCE HUB ─────────────────────────────
export const fetchResources = async (libraryId?: string, type?: string): Promise<Resource[]> => {
  let q = supabase.from('resources').select('*, uploader:profiles(name)').order('created_at', { ascending: false });
  if (libraryId) q = q.eq('library_id', libraryId);
  if (type) q = q.eq('resource_type', type);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(d => ({
    id: d.id, libraryId: d.library_id, uploadedBy: d.uploaded_by,
    title: d.title, description: d.description, resourceType: d.resource_type,
    url: d.url, fileSize: d.file_size, thumbnail: d.thumbnail,
    tags: d.tags || [], category: d.category, viewCount: d.view_count,
    isPublic: d.is_public, createdAt: d.created_at,
    uploader: d.uploader ? { name: d.uploader.name } : undefined
  }));
};

export const createResource = async (
  resource: Omit<Resource, 'id' | 'createdAt' | 'viewCount'>
): Promise<Resource> => {
  const { data, error } = await supabase.from('resources').insert({
    library_id: resource.libraryId, uploaded_by: resource.uploadedBy,
    title: resource.title, description: resource.description,
    resource_type: resource.resourceType, url: resource.url,
    file_size: resource.fileSize, thumbnail: resource.thumbnail,
    tags: resource.tags, category: resource.category, is_public: resource.isPublic
  }).select().single();
  if (error) throw error;
  return { ...resource, id: data.id, createdAt: data.created_at, viewCount: 0 };
};

export const incrementResourceViews = async (resourceId: string): Promise<void> => {
  try {
    await supabase.rpc('increment', { x: 1, row_id: resourceId, table_name: 'resources', field_name: 'view_count' });
  } catch {
    const { data } = await supabase.from('resources').select('view_count').eq('id', resourceId).single();
    if (data) await supabase.from('resources').update({ view_count: (data.view_count || 0) + 1 }).eq('id', resourceId);
  }
};

// ── 7. PREDICTIVE INTELLIGENCE ENGINE ─────────────────────
export const fetchMyAlerts = async (userId: string): Promise<AIAlert[]> => {
  const { data, error } = await supabase
    .from('ai_alerts').select('*').eq('target_user', userId)
    .order('created_at', { ascending: false }).limit(20);
  if (error) return [];
  return (data || []).map(d => ({
    id: d.id, libraryId: d.library_id, targetUser: d.target_user,
    alertType: d.alert_type, message: d.message, metadata: d.metadata || {},
    isRead: d.is_read, severity: d.severity, createdAt: d.created_at
  }));
};

export const runPredictiveEngine = async (libraryId: string): Promise<AIAlert[]> => {
  const alerts: AIAlert[] = [];

  // Check overdue transactions
  const { data: overdue } = await supabase.from('transactions')
    .select('*, profiles(id, name)').eq('library_id', libraryId)
    .eq('status', 'issued').lt('due_date', new Date().toISOString());

  for (const tx of (overdue || [])) {
    if (!tx.profiles?.id) continue;
    const { data: inserted } = await supabase.from('ai_alerts').insert({
      library_id: libraryId, target_user: tx.profiles.id,
      alert_type: 'overdue_risk',
      message: `Your borrowed book is overdue. Please return it to avoid fines.`,
      metadata: { transaction_id: tx.id, due_date: tx.due_date },
      severity: 'warning'
    }).select().single();
    if (inserted) alerts.push({ ...inserted, alertType: inserted.alert_type, targetUser: inserted.target_user, isRead: inserted.is_read });
  }

  return alerts;
};

export const generateClientAlerts = (
  transactions: any[], libraryId: string, userId: string
): AIAlert[] => {
  const alerts: AIAlert[] = [];
  const now = new Date();

  transactions.forEach(tx => {
    if (tx.status !== 'issued') return;
    const due = new Date(tx.dueDate || tx.due_date);
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);

    if (daysLeft < 0) {
      alerts.push({
        id: `overdue-${tx.id}`, libraryId, targetUser: userId,
        alertType: 'overdue_risk', severity: 'critical',
        message: `Book overdue by ${Math.abs(daysLeft)} day(s). Fine accumulating.`,
        metadata: { transactionId: tx.id }, isRead: false,
        createdAt: new Date().toISOString()
      });
    } else if (daysLeft <= 2) {
      alerts.push({
        id: `due-soon-${tx.id}`, libraryId, targetUser: userId,
        alertType: 'overdue_risk', severity: 'warning',
        message: `Book due in ${daysLeft} day(s). Please plan to return it.`,
        metadata: { transactionId: tx.id }, isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  return alerts;
};

export const markAlertRead = async (alertId: string): Promise<void> => {
  await supabase.from('ai_alerts').update({ is_read: true }).eq('id', alertId);
};

// ── SEARCH UTILITIES (ENHANCED) ───────────────────────────
export const globalSearch = async (query: string, libraryId?: string) => {
  const [books, resources] = await Promise.all([
    semanticSearch(query),
    (async () => {
      let q = supabase.from('resources').select('id, title, resource_type, description')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      if (libraryId) q = q.eq('library_id', libraryId);
      const { data } = await q;
      return (data || []).map(r => ({ ...r, _type: 'resource' }));
    })()
  ]);
  return { books: books.map(b => ({ ...b, _type: 'book' })), resources };
};

// ============================================================
// UNIVERSAL CONTENT SYSTEM SERVICES
// ============================================================

import type {
  MediaContent, ContentProgress, ContentAnnotation, AISummary, ContentLink, ContentType
} from '../types';

const mapContent = (d: any): MediaContent => ({
  id: d.id, libraryId: d.library_id, uploadedBy: d.uploaded_by,
  title: d.title, author: d.author, description: d.description,
  contentType: d.content_type, fileUrl: d.file_url, coverUrl: d.cover_url,
  durationSec: d.duration_sec, fileSize: d.file_size, pageCount: d.page_count,
  language: d.language || 'en', tags: d.tags || [],
  category: d.category, isbn: d.isbn, isPublic: d.is_public,
  isFree: d.is_free, viewCount: d.view_count || 0,
  downloadCount: d.download_count || 0, rating: Number(d.rating || 0),
  ratingsCount: d.ratings_count || 0, createdAt: d.created_at,
  uploader: d.uploader ? { name: d.uploader.name } : undefined
});

// ── MEDIA CONTENT ─────────────────────────────────────────
export const fetchMediaContent = async (
  libraryId?: string, type?: ContentType, limit = 50
): Promise<MediaContent[]> => {
  let q = supabase.from('media_content')
    .select('*, uploader:profiles(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (libraryId) q = q.eq('library_id', libraryId);
  if (type) q = q.eq('content_type', type);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapContent);
};

export const fetchContentById = async (id: string): Promise<MediaContent | null> => {
  const { data, error } = await supabase
    .from('media_content')
    .select('*, uploader:profiles(name), ai_summaries(*)')
    .eq('id', id).single();
  if (error) return null;
  const content = mapContent(data);
  if (data.ai_summaries) {
    content.aiSummary = {
      id: data.ai_summaries.id, contentId: id,
      summary: data.ai_summaries.summary,
      keyPoints: data.ai_summaries.key_points || [],
      difficulty: data.ai_summaries.difficulty,
      readTime: data.ai_summaries.read_time,
      generatedAt: data.ai_summaries.generated_at
    };
  }
  return content;
};

export const createMediaContent = async (
  content: Omit<MediaContent, 'id' | 'createdAt' | 'viewCount' | 'downloadCount' | 'rating' | 'ratingsCount'>
): Promise<MediaContent> => {
  const { data, error } = await supabase.from('media_content').insert({
    library_id: content.libraryId, uploaded_by: content.uploadedBy,
    title: content.title, author: content.author, description: content.description,
    content_type: content.contentType, file_url: content.fileUrl,
    cover_url: content.coverUrl, duration_sec: content.durationSec,
    page_count: content.pageCount, language: content.language,
    tags: content.tags, category: content.category, isbn: content.isbn,
    is_public: content.isPublic, is_free: content.isFree
  }).select().single();
  if (error) throw error;
  return mapContent(data);
};

export const searchMediaContent = async (query: string, libraryId?: string): Promise<MediaContent[]> => {
  let q = supabase.from('media_content')
    .select('*')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20);
  if (libraryId) q = q.eq('library_id', libraryId);
  const { data } = await q;
  return (data || []).map(mapContent);
};

// ── CONTENT PROGRESS ──────────────────────────────────────
export const fetchContentProgress = async (
  userId: string, contentId: string
): Promise<ContentProgress | null> => {
  // Try DB first, fall back to localStorage
  const { data } = await supabase.from('content_progress')
    .select('*').eq('user_id', userId).eq('content_id', contentId).single();
  if (data) return {
    id: data.id, userId: data.user_id, contentId: data.content_id,
    libraryId: data.library_id, progressPct: Number(data.progress_pct),
    currentPage: data.current_page, currentTimeSec: data.current_time_sec,
    totalTimeSec: data.total_time_sec, status: data.status,
    lastOpenedAt: data.last_opened_at, updatedAt: data.updated_at
  };
  // Fallback: localStorage
  const local = localStorage.getItem(`progress_${userId}_${contentId}`);
  return local ? JSON.parse(local) : null;
};

export const upsertContentProgress = async (
  userId: string, contentId: string, libraryId: string,
  patch: Partial<Omit<ContentProgress, 'id' | 'userId' | 'contentId' | 'libraryId'>>
): Promise<void> => {
  const payload = {
    user_id: userId, content_id: contentId, library_id: libraryId,
    progress_pct: patch.progressPct, current_page: patch.currentPage,
    current_time_sec: patch.currentTimeSec, total_time_sec: patch.totalTimeSec,
    status: patch.status, last_opened_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  // Always write to localStorage (offline-first)
  localStorage.setItem(`progress_${userId}_${contentId}`, JSON.stringify({
    ...patch, userId, contentId, libraryId, updatedAt: new Date().toISOString()
  }));
  // Best-effort Supabase sync
  await supabase.from('content_progress').upsert(payload, { onConflict: 'user_id,content_id' }).catch(() => {});
};

export const fetchAllUserProgress = async (userId: string): Promise<ContentProgress[]> => {
  const { data } = await supabase.from('content_progress')
    .select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  return (data || []).map(d => ({
    id: d.id, userId: d.user_id, contentId: d.content_id, libraryId: d.library_id,
    progressPct: Number(d.progress_pct), currentPage: d.current_page,
    currentTimeSec: d.current_time_sec, totalTimeSec: d.total_time_sec,
    status: d.status, lastOpenedAt: d.last_opened_at, updatedAt: d.updated_at
  }));
};

// ── ANNOTATIONS ───────────────────────────────────────────
export const fetchAnnotations = async (
  userId: string, contentId: string
): Promise<ContentAnnotation[]> => {
  const { data } = await supabase.from('content_annotations')
    .select('*').eq('user_id', userId).eq('content_id', contentId)
    .order('created_at', { ascending: true });
  if (data?.length) return data.map(d => ({
    id: d.id, userId: d.user_id, contentId: d.content_id,
    pageNum: d.page_num, startPos: d.start_pos, endPos: d.end_pos,
    highlight: d.highlight, note: d.note, color: d.color, createdAt: d.created_at
  }));
  // Fallback: localStorage
  const local = localStorage.getItem(`annotations_${userId}_${contentId}`);
  return local ? JSON.parse(local) : [];
};

export const saveAnnotation = async (
  annotation: Omit<ContentAnnotation, 'id' | 'createdAt'>
): Promise<ContentAnnotation> => {
  const id = Math.random().toString(36).slice(2);
  const createdAt = new Date().toISOString();
  const full: ContentAnnotation = { ...annotation, id, createdAt };

  // Save to localStorage immediately
  const key = `annotations_${annotation.userId}_${annotation.contentId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([...existing, full]));

  // Best-effort DB
  await supabase.from('content_annotations').insert({
    user_id: annotation.userId, content_id: annotation.contentId,
    page_num: annotation.pageNum, highlight: annotation.highlight,
    note: annotation.note, color: annotation.color,
    start_pos: annotation.startPos, end_pos: annotation.endPos
  }).catch(() => {});
  return full;
};

export const deleteAnnotation = async (
  userId: string, contentId: string, annotationId: string
): Promise<void> => {
  const key = `annotations_${userId}_${contentId}`;
  const existing: ContentAnnotation[] = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify(existing.filter(a => a.id !== annotationId)));
  await supabase.from('content_annotations').delete().eq('id', annotationId).catch(() => {});
};

// ── AI SUMMARIES (Rule-based generation) ─────────────────
export const fetchOrGenerateSummary = async (content: MediaContent): Promise<AISummary> => {
  // Check DB cache first
  const { data } = await supabase.from('ai_summaries')
    .select('*').eq('content_id', content.id).single();
  if (data) return {
    id: data.id, contentId: data.content_id, summary: data.summary,
    keyPoints: data.key_points || [], difficulty: data.difficulty,
    readTime: data.read_time, generatedAt: data.generated_at
  };

  // Rule-based generation (no external API needed)
  const wordCount = (content.description || content.title).split(' ').length;
  const readTime = Math.max(1, Math.ceil((content.pageCount || 50) * 2 / 60));
  const difficulty = content.tags.some(t => ['advanced', 'research', 'phd'].includes(t.toLowerCase()))
    ? 'advanced' : content.tags.some(t => ['intro', 'beginner', 'basics'].includes(t.toLowerCase()))
    ? 'beginner' : 'intermediate';

  const keyPoints = [
    `Explores key themes in ${content.category || 'academic'} study`,
    `Written by ${content.author || 'a domain expert'} for ${difficulty}-level readers`,
    `Estimated ${readTime} minute read covering ${content.pageCount || '?'} pages`,
    `Tagged under: ${content.tags.slice(0, 3).join(', ') || 'general knowledge'}`,
    `Available as ${content.contentType.replace('_', ' ')} in ${content.language.toUpperCase()}`
  ];

  const summary = content.description ||
    `"${content.title}" by ${content.author || 'Unknown Author'} is a ${difficulty}-level ${content.contentType} ` +
    `resource in the ${content.category || 'academic'} domain. This work offers an in-depth exploration of its subject ` +
    `matter, making it suitable for ${difficulty === 'beginner' ? 'newcomers' : difficulty === 'advanced' ? 'advanced practitioners' : 'intermediate learners'}.`;

  const generated: AISummary = {
    id: Math.random().toString(36).slice(2), contentId: content.id,
    summary, keyPoints, difficulty, readTime, generatedAt: new Date().toISOString()
  };

  // Cache in DB
  await supabase.from('ai_summaries').upsert({
    content_id: content.id, summary, key_points: keyPoints,
    difficulty, read_time: readTime, generated_at: generated.generatedAt
  }, { onConflict: 'content_id' }).catch(() => {});

  return generated;
};

// ── CONTENT LINKS ─────────────────────────────────────────
export const fetchRelatedContent = async (contentId: string): Promise<ContentLink[]> => {
  const { data } = await supabase.from('content_links')
    .select('*, target:media_content!content_links_target_id_fkey(id, title, content_type, cover_url, author)')
    .eq('source_id', contentId);
  return (data || []).map(d => ({
    id: d.id, sourceId: d.source_id, targetId: d.target_id,
    linkType: d.link_type, createdBy: d.created_by, createdAt: d.created_at,
    target: d.target ? { id: d.target.id, title: d.target.title, contentType: d.target.content_type, coverUrl: d.target.cover_url, author: d.target.author } : undefined
  }));
};

// ── RECOMMENDATIONS ───────────────────────────────────────
export const fetchRecommendedContent = async (
  userId: string, libraryId?: string, limit = 8
): Promise<MediaContent[]> => {
  // Get user's progress to find their preferred categories
  const { data: progress } = await supabase.from('content_progress')
    .select('content_id, media_content(category)').eq('user_id', userId).limit(10);
  const categories = [...new Set((progress || []).map((p: any) => p.media_content?.category).filter(Boolean))];

  let q = supabase.from('media_content').select('*').order('view_count', { ascending: false }).limit(limit);
  if (libraryId) q = q.eq('library_id', libraryId);
  if (categories.length) q = q.in('category', categories);
  const { data } = await q;
  return (data || []).map(mapContent);
};

// ── CONTENT UPLOAD (Storage) ──────────────────────────────
export const uploadContentFile = async (
  file: File, path: string
): Promise<string> => {
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};

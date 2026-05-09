export interface Library {
  id: string;
  name: string;
  domain?: string;
  branding?: any;
  timezone?: string;
  createdAt: string;
}

export type UserRole = 'student' | 'teacher' | 'librarian' | 'admin';

export interface User {
  id: string;
  libraryId: string;
  library_id?: string;
  name: string;
  full_name?: string;
  email: string;
  role: UserRole | string;
  avatarUrl?: string;
  avatar_url?: string;
  bio?: string;
  borrowedCount?: number;
  maxLimit?: number;
  xp?: number;
  streak_days?: number;
  reading_dna?: any;
  createdAt: string;
  created_at?: string;
}

export interface Book {
  id: string;
  libraryId: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverUrl?: string; // Derived or UI-only if not in schema
  category?: string;
  rating?: number;
  reviewsCount?: number;
  publishedYear?: number;
  pages?: number;
  language?: string;
  synopsis?: string;
  location?: string;
  publisher?: string;
  available?: boolean;
  createdAt: string;
}

export interface BookCopy {
  id: string;
  libraryId: string;
  bookId: string;
  status: 'available' | 'issued' | 'maintenance';
  condition?: string;
  conditionScore: number;
  rescueCount: number;
  totalReaders: number;
  longestJourney?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  libraryId: string;
  userId: string;
  bookCopyId: string;
  issueDate: string;
  dueDate?: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
  fine: number;
}

// --- Academic LMS Layer ---

export interface Course {
  id: string;
  libraryId: string;
  code: string;
  title: string;
  description: string;
  syllabus: any; // JSONB in SQL
  teacherId: string;
  createdAt: string;
  teacher?: Partial<User>;
}

export interface Enrollment {
  id: string;
  libraryId: string;
  userId: string;
  courseId: string;
  progressPercentage: number;
  createdAt: string;
  course?: Partial<Course>;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface Skill {
  id: string;
  topicId: string;
  name: string;
  level: string; // Matches 'level' in SQL
}

export interface BookTopic {
  id: string;
  bookId: string;
  topicId: string;
}

// --- Living ISBN Module ---

export const CopyEventType = {
  CHECKED_OUT: 'CHECKED_OUT',
  RETURNED: 'RETURNED',
  REPAIRED: 'REPAIRED',
  RESCUED: 'RESCUED',
  ANNOTATED: 'ANNOTATED',
  LOST_AND_FOUND: 'LOST_AND_FOUND',
  RETIRED: 'RETIRED',
  DONATED: 'DONATED'
} as const;

export type CopyEventType = typeof CopyEventType[keyof typeof CopyEventType];

export interface CopyTimelineEvent {
  id: string;
  libraryId: string;
  bookCopyId: string;
  userId: string;
  actorName?: string;
  eventType: CopyEventType | string;
  note?: string;
  isAnonymous: boolean;
  locationTag?: string;
  createdAt: string;
}

export interface CopyQR {
  id: string;
  bookCopyId: string;
  qrToken: string;
  publicUrl?: string;
  stickerPrinted: boolean;
  createdAt: string;
}

// --- Gamification & Stats ---

export interface UserStats {
  userId: string;
  libraryId: string;
  totalPoints: number;
  readingStreak: number;
  booksRead: number;
  updatedAt: string;
}

// --- Offline Sync Engine ---

export interface SyncQueueItem {
  id: string;
  userId: string;
  libraryId: string;
  actionType: string;
  tableName: string;
  payload: any;
  synced: boolean;
  createdAt: string;
}

// --- UI/Legacy Helpers (Keep for build stability) ---
export interface FeedEvent {
  id: string;
  libraryId: string;
  userId: string;
  eventType: string;
  content?: string;
  createdAt: string;
  user?: Pick<User, 'name' | 'avatarUrl'>;
  book?: Pick<Book, 'title' | 'coverUrl'>;
}

export interface ReadingNote {
  id: string;
  bookId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ReadingRoom {
  id: string;
  bookId: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

// ============================================================
// NEXT-GEN FEATURE TYPES
// ============================================================

// 1. Knowledge Passport
export interface KnowledgePassport {
  id: string;
  userId: string;
  libraryId: string;
  globalScore: number;
  skills: string[];
  achievements: Achievement[];
  booksRead: number;
  coursesDone: number;
  public: boolean;
  updatedAt: string;
  // Joined profile
  profile?: Partial<User>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// 2. Book Personality Engine
export interface BookPersonality {
  id: string;
  bookId: string;
  libraryId: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sentimentScore: number; // 0-1
  engagementScore: number; // 0-1
  completionRate: number;
  personalityTags: string[];
  totalNotes: number;
  lastAnalyzedAt: string;
}

// 3. Live Heatmap
export interface BookUsageLog {
  id: string;
  bookId: string;
  userId: string;
  libraryId: string;
  location: string;
  lat?: number;
  lng?: number;
  action: 'view' | 'borrow' | 'search';
  createdAt: string;
}

export interface HeatmapPoint {
  location: string;
  lat: number;
  lng: number;
  count: number;
  books: string[];
}

// 4. Peer Matchmaking
export interface UserInterest {
  id: string;
  userId: string;
  libraryId: string;
  topicId: string;
  weight: number;
  createdAt: string;
}

export interface PeerMatch {
  id: string;
  libraryId: string;
  user1Id: string;
  user2Id: string;
  matchScore: number;
  commonBooks: string[];
  commonTopics: string[];
  status: 'suggested' | 'connected' | 'dismissed';
  createdAt: string;
  // Joined
  peer?: Partial<User>;
}

// 5. Smart Study Mode
export interface StudySession {
  id: string;
  userId: string;
  bookId: string;
  libraryId: string;
  title: string;
  totalChapters: number;
  chaptersDone: number;
  progressPct: number;
  notes: StudyNote[];
  checkpoints: StudyCheckpoint[];
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  updatedAt: string;
  // Joined
  book?: Partial<Book>;
}

export interface StudyNote {
  chapter: number;
  text: string;
  createdAt: string;
}

export interface StudyCheckpoint {
  chapter: number;
  completedAt: string;
}

// 6. Universal Resource Hub
export type ResourceType = 'pdf' | 'video' | 'paper' | 'book' | 'link' | 'audio';

export interface Resource {
  id: string;
  libraryId: string;
  uploadedBy: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url?: string;
  fileSize?: number;
  thumbnail?: string;
  tags: string[];
  category?: string;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
  uploader?: Partial<User>;
}

// 7. AI Alerts (Predictive Intelligence)
export type AlertType = 'overdue_risk' | 'high_demand' | 'inactivity' | 'recommendation';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AIAlert {
  id: string;
  libraryId: string;
  targetUser: string;
  alertType: AlertType;
  message: string;
  metadata: Record<string, any>;
  isRead: boolean;
  severity: AlertSeverity;
  createdAt: string;
}

// ============================================================
// UNIVERSAL CONTENT SYSTEM TYPES
// ============================================================

export type ContentType = 'ebook' | 'audiobook' | 'video' | 'paper' | 'novel' | 'lecture';

export interface MediaContent {
  id: string;
  libraryId: string;
  uploadedBy: string;
  title: string;
  author?: string;
  description?: string;
  contentType: ContentType;
  fileUrl?: string;
  coverUrl?: string;
  durationSec?: number;
  fileSize?: number;
  pageCount?: number;
  language: string;
  tags: string[];
  category?: string;
  isbn?: string;
  isPublic: boolean;
  isFree: boolean;
  viewCount: number;
  downloadCount: number;
  rating: number;
  ratingsCount: number;
  createdAt: string;
  uploader?: Partial<User>;
  progress?: ContentProgress;
  aiSummary?: AISummary;
}

export interface ContentProgress {
  id: string;
  userId: string;
  contentId: string;
  libraryId: string;
  progressPct: number;
  currentPage: number;
  currentTimeSec: number;
  totalTimeSec: number;
  status: 'in_progress' | 'completed' | 'paused';
  lastOpenedAt: string;
  updatedAt: string;
}

export interface ContentAnnotation {
  id: string;
  userId: string;
  contentId: string;
  pageNum: number;
  startPos?: number;
  endPos?: number;
  highlight?: string;
  note?: string;
  color: string;
  createdAt: string;
}

export interface AISummary {
  id: string;
  contentId: string;
  summary: string;
  keyPoints: string[];
  difficulty?: string;
  readTime?: number;
  generatedAt: string;
}

export interface ContentLink {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: 'related' | 'prerequisite' | 'reference' | 'sequel';
  createdBy: string;
  createdAt: string;
  target?: Partial<MediaContent>;
}

-- ==========================================
-- SMART ACADEMIC RESOURCE PLATFORM (GLOBAL)
-- CORE SCHEMA EVOLUTION
-- ==========================================

-- 1. INSTITUTIONS / LIBRARIES (Multi-tenant Foundation)
CREATE TABLE IF NOT EXISTS libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE, -- e.g., 'mit.edu', 'oxford.ac.uk'
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENHANCED PROFILES (RBAC + Multi-tenancy)
-- Note: Extends existing profiles table if it exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'teacher', 'librarian', 'admin');
    END IF;
END $$;

ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS library_id UUID REFERENCES libraries(id),
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'student',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS enrollment_id TEXT; -- Student ID provided by library

-- 3. ACADEMIC LMS (Courses & Learning)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES libraries(id),
    teacher_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    code TEXT, -- e.g., 'CS101'
    syllabus JSONB DEFAULT '[]', -- List of book IDs and resources
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    student_id UUID NOT NULL REFERENCES profiles(id),
    progress_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'enrolled', -- 'enrolled', 'completed', 'dropped'
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, student_id)
);

-- 4. ENHANCED BOOK CATALOG
-- Note: Associate books with libraries for distinct collections
ALTER TABLE IF EXISTS books 
ADD COLUMN IF NOT EXISTS library_id UUID REFERENCES libraries(id);

-- 5. KNOWLEDGE GRAPH & LEARNING PATHS
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID REFERENCES libraries(id), -- Null for global topics
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    topic_id UUID REFERENCES topics(id),
    difficulty TEXT DEFAULT 'beginner' -- 'beginner', 'intermediate', 'advanced'
);

CREATE TABLE IF NOT EXISTS book_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id),
    topic_id UUID REFERENCES topics(id),
    relevance_score FLOAT DEFAULT 1.0
);

-- 6. SOCIAL COLLABORATION (Follows & Activity)
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES profiles(id),
    following_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID REFERENCES libraries(id),
    user_id UUID REFERENCES profiles(id),
    action_type TEXT NOT NULL, -- 'read', 'borrowed', 'joined_course', 'achievement'
    target_id UUID, -- book_id, course_id, etc.
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SYNC ENGINE (Offline Support)
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    client_action_id TEXT, -- For idempotency
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'failed'
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ROW LEVEL SECURITY (RLS)
-- Mandatory for multi-tenancy

ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Libraries: Anyone can view (for discovery), only admins can edit
CREATE POLICY "Libraries are viewable by everyone" ON libraries FOR SELECT USING (true);

-- Profiles: Users see others in their library, only self can update
CREATE POLICY "Users view profiles in same library" ON profiles FOR SELECT 
USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

-- Courses: Restricted by library_id
CREATE POLICY "Library specific courses" ON courses FOR ALL 
USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

-- Books: Restricted by library_id
CREATE POLICY "Library specific books" ON books FOR ALL 
USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_books_library ON books(library_id);
CREATE INDEX IF NOT EXISTS idx_profiles_library ON profiles(library_id);
CREATE INDEX IF NOT EXISTS idx_courses_library ON courses(library_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_library ON activity_feed(library_id);

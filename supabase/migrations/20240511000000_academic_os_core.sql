-- ================================
-- ACADEMIC OS CORE SCHEMA
-- ================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- A. INSTITUTIONAL MANAGEMENT
CREATE TABLE IF NOT EXISTS libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  branding JSONB,
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. USER & RBAC
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  library_id UUID REFERENCES libraries(id),
  name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('student','teacher','librarian','admin')) DEFAULT 'student',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  library_id UUID REFERENCES libraries(id),
  total_points INT DEFAULT 0,
  reading_streak INT DEFAULT 0,
  books_read INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. ACADEMIC LMS
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES libraries(id),
  title TEXT,
  description TEXT,
  syllabus JSONB,
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES libraries(id),
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  progress_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  name TEXT,
  level TEXT
);

CREATE TABLE IF NOT EXISTS book_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID,
  topic_id UUID REFERENCES topics(id)
);

-- D. INVENTORY & LOGISTICS
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES libraries(id),
  title TEXT,
  author TEXT,
  isbn TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES libraries(id),
  book_id UUID REFERENCES books(id),
  status TEXT CHECK (status IN ('available','issued','maintenance')) DEFAULT 'available',
  condition TEXT,
  condition_score INT DEFAULT 100,
  rescue_count INT DEFAULT 0,
  total_readers INT DEFAULT 0,
  longest_journey TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES libraries(id),
  user_id UUID REFERENCES profiles(id),
  book_copy_id UUID REFERENCES book_copies(id),
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('issued','returned','overdue')),
  fine NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS copy_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES libraries(id),
  book_copy_id UUID REFERENCES book_copies(id),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT,
  note TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  location_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copy_qr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_copy_id UUID REFERENCES book_copies(id),
  qr_token TEXT UNIQUE,
  public_url TEXT,
  sticker_printed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFLINE SYNC ENGINE
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  library_id UUID,
  action_type TEXT,
  table_name TEXT,
  payload JSONB,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES (PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_books_library ON books(library_id);
CREATE INDEX IF NOT EXISTS idx_profiles_library ON profiles(library_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_book_copies_book ON book_copies(book_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_books_search 
ON books USING GIN (to_tsvector('english', title || ' ' || author));

-- RLS ENABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
DROP POLICY IF EXISTS "Library Isolation" ON books;
CREATE POLICY "Library Isolation"
ON books
FOR SELECT
USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Own Profile" ON profiles;
CREATE POLICY "Own Profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Own Transactions" ON transactions;
CREATE POLICY "Own Transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);

-- TRIGGER: AUTO PROFILE
CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile();

-- RPC FUNCTION (ATOMIC ISSUE BOOK)
CREATE OR REPLACE FUNCTION issue_book_rpc(p_user_id UUID, p_book_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_copy_id UUID;
BEGIN
    -- Find an available copy
    SELECT id INTO v_copy_id 
    FROM book_copies 
    WHERE book_id = p_book_id AND status = 'available' 
    LIMIT 1;

    IF v_copy_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No copies available');
    END IF;

    -- Update copy status
    UPDATE book_copies SET status = 'issued' WHERE id = v_copy_id;

    -- Create transaction
    INSERT INTO transactions(user_id, book_copy_id, status, issue_date, due_date)
    VALUES (p_user_id, v_copy_id, 'issued', NOW(), NOW() + INTERVAL '14 days');

    RETURN jsonb_build_object('success', true, 'copy_id', v_copy_id);
END;
$$ LANGUAGE plpgsql;

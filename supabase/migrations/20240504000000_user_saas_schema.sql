-- ================================
-- EXTENSIONS
-- ================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- LIBRARIES (Multi-tenant)
-- ================================
CREATE TABLE libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- PROFILES (User System)
-- ================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  library_id UUID REFERENCES libraries(id),
  borrowed_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- BOOKS (Master)
-- ================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- BOOK COPIES (Living ISBN)
-- ================================
CREATE TABLE book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  library_id UUID REFERENCES libraries(id),
  status TEXT CHECK (status IN ('available', 'issued')) DEFAULT 'available',
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- TRANSACTIONS
-- ================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  book_copy_id UUID REFERENCES book_copies(id),
  issue_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  return_date TIMESTAMP,
  status TEXT CHECK (status IN ('issued', 'returned', 'overdue')) DEFAULT 'issued',
  fine NUMERIC DEFAULT 0
);

-- ================================
-- BOOK TIMELINE (Living ISBN Story)
-- ================================
CREATE TABLE book_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_copy_id UUID REFERENCES book_copies(id),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT CHECK (event_type IN ('issued', 'returned', 'note_added')),
  note TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- SOCIAL NOTES
-- ================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  book_id UUID REFERENCES books(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- LIKES
-- ================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  note_id UUID REFERENCES notes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- FOLLOWS
-- ================================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- BOOK ANALYTICS (Book DNA)
-- ================================
CREATE TABLE book_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id),
  total_issues INT DEFAULT 0,
  avg_reading_time INT,
  popularity_score NUMERIC DEFAULT 0
);

-- ================================
-- NOTIFICATIONS
-- ================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- INDEXES (Performance)
-- ================================
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_book_copies_book ON book_copies(book_id);

-- ================================
-- TRIGGER: AUTO CREATE PROFILE
-- ================================
CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile();

-- ================================
-- ENABLE RLS
-- ================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ================================
-- RLS POLICIES
-- ================================

-- Profiles: user can read/update own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Transactions: only own
CREATE POLICY "Users can view own transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Notes: public read
CREATE POLICY "Anyone can read notes"
ON notes
FOR SELECT
USING (true);

-- Notes: only owner write
CREATE POLICY "Users can insert own notes"
ON notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ================================
-- DONE 🚀
-- ================================

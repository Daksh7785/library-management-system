-- ============================================================
-- AcademicOS — PRODUCTION CONSOLIDATED SCHEMA
-- Run this ONCE on a fresh Supabase project.
-- It is IDEMPOTENT (safe to re-run).
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- trigram fuzzy search

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin','faculty','librarian')),
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active DATE,
  reading_dna JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. BOOKS (world-scale catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL DEFAULT 'Unknown',
  isbn TEXT,
  isbn_13 VARCHAR(13),
  isbn_10 VARCHAR(10),
  open_lib_id VARCHAR(50),
  google_id VARCHAR(50),
  description TEXT,
  cover_url TEXT,
  publisher TEXT,
  published_year INTEGER,
  total_pages INTEGER,
  pages INTEGER,
  language TEXT DEFAULT 'en',
  genre TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  demand_score FLOAT DEFAULT 0,
  source TEXT DEFAULT 'manual',
  confidence_score FLOAT DEFAULT 1.0,
  available BOOLEAN DEFAULT TRUE,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraints (partial — only when value is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_isbn13_unique ON books(isbn_13) WHERE isbn_13 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_isbn_unique ON books(isbn) WHERE isbn IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_ol_id_unique ON books(open_lib_id) WHERE open_lib_id IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin (author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_source ON books(source);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published_year);
CREATE INDEX IF NOT EXISTS idx_books_subjects ON books USING gin (subjects);

-- ============================================================
-- 3. EDITIONS (multiple physical formats of a work)
-- ============================================================
CREATE TABLE IF NOT EXISTS editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  isbn_13 VARCHAR(13),
  isbn_10 VARCHAR(10),
  publisher TEXT,
  format TEXT CHECK (format IN ('hardcover','paperback','ebook','audiobook')),
  published_year SMALLINT,
  language VARCHAR(10),
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_editions_book ON editions(book_id);

-- ============================================================
-- 4. BOOK COPIES (physical inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  qr_code TEXT UNIQUE NOT NULL,
  condition_score INTEGER DEFAULT 100 CHECK (condition_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','issued','lost','retired')),
  location_shelf TEXT,
  acquired_date DATE DEFAULT CURRENT_DATE,
  parent_copy_id UUID REFERENCES book_copies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_copies_book ON book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_copies_status ON book_copies(status);

-- ============================================================
-- 5. TRANSACTIONS (borrow/return)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  copy_id UUID NOT NULL REFERENCES book_copies(id),
  book_id UUID NOT NULL REFERENCES books(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  overdue_fine FLOAT DEFAULT 0,
  condition_on_return INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_book ON transactions(book_id);

-- ============================================================
-- 6. HOLDS / WAITLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  position INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting','ready','fulfilled','cancelled')),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_holds_user ON holds(user_id);
CREATE INDEX IF NOT EXISTS idx_holds_book ON holds(book_id);

-- ============================================================
-- 7. USER_BOOKS (reading status, ratings, reviews)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('reading','completed','wishlist','dropped')) DEFAULT 'wishlist',
  progress_percentage INTEGER DEFAULT 0,
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  review TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
CREATE INDEX IF NOT EXISTS idx_ub_user ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_ub_status ON user_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ub_book ON user_books(book_id);

-- ============================================================
-- 8. SEARCH HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  source TEXT DEFAULT 'catalog',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sh_user ON search_history(user_id);

-- ============================================================
-- 9. READING SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  pages_read INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  mood TEXT
);

-- ============================================================
-- 10. WORKER JOB LOG (track ETL & worker status)
-- ============================================================
CREATE TABLE IF NOT EXISTS job_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('etl_import','enrichment','index_sync','recommendation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON job_log(job_type, status);

-- ============================================================
-- 11. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. INVENTORY HEALTH VIEW
-- ============================================================
CREATE OR REPLACE VIEW inventory_health AS
SELECT
  b.id,
  b.title,
  b.author,
  COUNT(bc.id) AS total_copies,
  COUNT(bc.id) FILTER (WHERE bc.status = 'available') AS available_copies,
  COALESCE(AVG(bc.condition_score), 0) AS avg_condition,
  COUNT(h.id) FILTER (WHERE h.status = 'waiting') AS hold_queue_depth,
  CASE
    WHEN AVG(bc.condition_score) > 80 AND COUNT(bc.id) FILTER (WHERE bc.status = 'available') > 0 THEN 'A'
    WHEN AVG(bc.condition_score) > 60 THEN 'B'
    WHEN AVG(bc.condition_score) > 40 THEN 'C'
    WHEN AVG(bc.condition_score) > 20 THEN 'D'
    ELSE 'F'
  END AS health_grade
FROM books b
LEFT JOIN book_copies bc ON bc.book_id = b.id
LEFT JOIN holds h ON h.book_id = b.id
GROUP BY b.id, b.title, b.author;

-- ============================================================
-- 13. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, admins see all
DROP POLICY IF EXISTS "profiles_own" ON profiles;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin" ON profiles;
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Books: everyone reads, admins write
DROP POLICY IF EXISTS "books_read" ON books;
CREATE POLICY "books_read" ON books FOR SELECT USING (true);
DROP POLICY IF EXISTS "books_admin_write" ON books;
CREATE POLICY "books_admin_write" ON books FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','faculty'))
);
DROP POLICY IF EXISTS "books_admin_update" ON books;
CREATE POLICY "books_admin_update" ON books FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','faculty'))
);

-- Book copies: everyone reads
DROP POLICY IF EXISTS "copies_read" ON book_copies;
CREATE POLICY "copies_read" ON book_copies FOR SELECT USING (true);

-- Transactions: own data
DROP POLICY IF EXISTS "tx_own" ON transactions;
CREATE POLICY "tx_own" ON transactions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tx_admin" ON transactions;
CREATE POLICY "tx_admin" ON transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Holds: own data
DROP POLICY IF EXISTS "holds_own" ON holds;
CREATE POLICY "holds_own" ON holds FOR ALL USING (auth.uid() = user_id);

-- User books: own data
DROP POLICY IF EXISTS "ub_own" ON user_books;
CREATE POLICY "ub_own" ON user_books FOR ALL USING (auth.uid() = user_id);

-- Search history: own data
DROP POLICY IF EXISTS "sh_own" ON search_history;
CREATE POLICY "sh_own" ON search_history FOR ALL USING (auth.uid() = user_id);

-- Reading sessions: own data
DROP POLICY IF EXISTS "rs_own" ON reading_sessions;
CREATE POLICY "rs_own" ON reading_sessions FOR ALL USING (auth.uid() = user_id);

-- Editions: public read
DROP POLICY IF EXISTS "editions_read" ON editions;
CREATE POLICY "editions_read" ON editions FOR SELECT USING (true);

-- Job log: admin only
DROP POLICY IF EXISTS "jobs_admin" ON job_log;
CREATE POLICY "jobs_admin" ON job_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- 14. RPC FUNCTIONS
-- ============================================================

-- Atomic hold placement
CREATE OR REPLACE FUNCTION place_hold(p_user_id UUID, p_book_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_position INTEGER;
  v_hold_id UUID;
BEGIN
  PERFORM id FROM books WHERE id = p_book_id FOR UPDATE;
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
    FROM holds WHERE book_id = p_book_id AND status = 'waiting';
  INSERT INTO holds (user_id, book_id, position, status, expires_at)
    VALUES (p_user_id, p_book_id, v_position, 'waiting', NOW() + INTERVAL '7 days')
    RETURNING id INTO v_hold_id;
  RETURN jsonb_build_object('hold_id', v_hold_id, 'position', v_position);
END;
$$;

-- Dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_books', (SELECT COUNT(*) FROM books),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_borrows', (SELECT COUNT(*) FROM transactions WHERE returned_at IS NULL),
    'pending_holds', (SELECT COUNT(*) FROM holds WHERE status = 'waiting'),
    'books_today', (SELECT COUNT(*) FROM books WHERE created_at >= CURRENT_DATE),
    'etl_jobs', (SELECT jsonb_agg(row_to_json(j)) FROM (
      SELECT job_type, status, records_processed, started_at
      FROM job_log ORDER BY started_at DESC LIMIT 5
    ) j)
  ) INTO result;
  RETURN result;
END;
$$;

-- User reading stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'books_reading', (SELECT COUNT(*) FROM user_books WHERE user_id = p_user_id AND status = 'reading'),
    'books_completed', (SELECT COUNT(*) FROM user_books WHERE user_id = p_user_id AND status = 'completed'),
    'books_wishlist', (SELECT COUNT(*) FROM user_books WHERE user_id = p_user_id AND status = 'wishlist'),
    'total_interactions', (SELECT COUNT(*) FROM user_books WHERE user_id = p_user_id),
    'avg_rating', (SELECT COALESCE(AVG(rating), 0) FROM user_books WHERE user_id = p_user_id AND rating IS NOT NULL),
    'recent_books', (SELECT jsonb_agg(row_to_json(r)) FROM (
      SELECT ub.status, ub.rating, ub.updated_at, b.title, b.author, b.cover_url
      FROM user_books ub JOIN books b ON b.id = ub.book_id
      WHERE ub.user_id = p_user_id
      ORDER BY ub.updated_at DESC LIMIT 10
    ) r)
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- 15. SEED DATA — 30 academic books
-- ============================================================
INSERT INTO books (isbn, title, author, genre, description, published_year, total_pages, tags, category, source) VALUES
('9780061965784','The Hobbit','J.R.R. Tolkien','Fantasy','Bilbo Baggins journey',1937,310,ARRAY['adventure','classic'],'Fiction','seed'),
('9780743273565','The Great Gatsby','F. Scott Fitzgerald','Classic','The American Dream',1925,180,ARRAY['classic','american'],'Fiction','seed'),
('9780062316097','The Alchemist','Paulo Coelho','Fiction','A shepherds journey',1988,208,ARRAY['philosophy','journey'],'Fiction','seed'),
('9780062498533','Sapiens','Yuval Noah Harari','Non-Fiction','A brief history of humankind',2011,443,ARRAY['history','science'],'Non-Fiction','seed'),
('9780743477109','1984','George Orwell','Dystopia','A totalitarian surveillance state',1949,328,ARRAY['dystopia','political'],'Fiction','seed'),
('9780062457714','Thinking Fast and Slow','Daniel Kahneman','Psychology','Two systems of thought',2011,499,ARRAY['psychology','cognitive'],'Non-Fiction','seed'),
('9780375831003','To Kill a Mockingbird','Harper Lee','Classic','Racial injustice',1960,281,ARRAY['classic','social'],'Fiction','seed'),
('9780553380163','A Brief History of Time','Stephen Hawking','Science','From Big Bang to black holes',1988,212,ARRAY['science','physics'],'Science','seed'),
('9780062409850','Atomic Habits','James Clear','Self-Help','Tiny changes remarkable results',2018,320,ARRAY['habits','productivity'],'Self-Help','seed'),
('9780374533557','The Stranger','Albert Camus','Philosophy','Existentialism',1942,123,ARRAY['philosophy','classic'],'Fiction','seed'),
('9780062440761','Deep Work','Cal Newport','Productivity','Focused success',2016,296,ARRAY['productivity','focus'],'Self-Help','seed'),
('9780525559474','The Midnight Library','Matt Haig','Fiction','Infinite possibilities',2020,304,ARRAY['fiction','magical'],'Fiction','seed'),
('9780132350884','Clean Code','Robert C. Martin','Technology','Agile software craftsmanship',2008,464,ARRAY['programming','software'],'Technology','seed'),
('9780201633610','Design Patterns','Gang of Four','Technology','Elements of reusable OO software',1994,395,ARRAY['programming','patterns'],'Technology','seed'),
('9780596007126','Head First Design Patterns','Eric Freeman','Technology','Brain-friendly guide',2004,694,ARRAY['programming','patterns'],'Technology','seed'),
('9780134685991','Effective Java','Joshua Bloch','Technology','Best practices for Java',2018,412,ARRAY['java','programming'],'Technology','seed'),
('9780262033848','Introduction to Algorithms','Thomas Cormen','Technology','The CLRS classic',2009,1312,ARRAY['algorithms','cs'],'Technology','seed'),
('9780321125217','Domain-Driven Design','Eric Evans','Technology','Tackling complexity in software',2003,560,ARRAY['architecture','ddd'],'Technology','seed'),
('9780596517748','JavaScript The Good Parts','Douglas Crockford','Technology','Most useful JS subset',2008,176,ARRAY['javascript','web'],'Technology','seed'),
('9781491950357','Learning Python','Mark Lutz','Technology','Comprehensive Python guide',2013,1648,ARRAY['python','programming'],'Technology','seed'),
('9780062678492','Dune','Frank Herbert','Sci-Fi','Desert planet politics',1965,896,ARRAY['scifi','classic'],'Fiction','seed'),
('9780525651024','The Song of Achilles','Madeline Miller','Historical','Achilles and Patroclus',2011,369,ARRAY['mythology','literary'],'Fiction','seed'),
('9780062690623','Educated','Tara Westover','Memoir','Family education self-invention',2018,334,ARRAY['memoir','education'],'Non-Fiction','seed'),
('9780385333481','The Handmaid''s Tale','Margaret Atwood','Dystopia','Totalitarian theocratic society',1985,311,ARRAY['dystopia','feminist'],'Fiction','seed'),
('9780143127550','Thinking in Systems','Donella Meadows','Science','Systems thinking primer',2008,240,ARRAY['systems','science'],'Science','seed'),
('9780316346627','The Catcher in the Rye','J.D. Salinger','Classic','Teenage alienation',1951,277,ARRAY['classic','american'],'Fiction','seed'),
('9780385490818','The Power of Habit','Charles Duhigg','Self-Help','Why we do what we do',2012,371,ARRAY['habits','psychology'],'Self-Help','seed'),
('9780140283334','Crime and Punishment','Fyodor Dostoevsky','Classic','A student commits murder',1866,545,ARRAY['classic','russian'],'Fiction','seed'),
('9780385737951','The Hunger Games','Suzanne Collins','YA','Televised death tournament',2008,374,ARRAY['dystopia','ya'],'Fiction','seed'),
('9780062301239','Between the World and Me','Ta-Nehisi Coates','Non-Fiction','Being Black in America',2015,152,ARRAY['race','memoir'],'Non-Fiction','seed')
ON CONFLICT (isbn) DO NOTHING;

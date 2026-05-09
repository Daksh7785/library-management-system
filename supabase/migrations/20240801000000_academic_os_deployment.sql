-- USERS & AUTH
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'faculty')),
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active DATE,
  reading_dna JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKS (catalog level)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT,
  description TEXT,
  cover_url TEXT,
  publisher TEXT,
  published_year INTEGER,
  total_pages INTEGER,
  language TEXT DEFAULT 'English',
  tags TEXT[],
  demand_score FLOAT DEFAULT 0,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHYSICAL COPIES
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

-- TRANSACTIONS (borrow/return)
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
  secret_message_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOLDS / WAITLIST
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

-- READING SESSIONS (for streaks and XP)
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

-- SOCIAL ANNOTATIONS (secret marginalia)
CREATE TABLE IF NOT EXISTS annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id UUID NOT NULL REFERENCES book_copies(id),
  author_id UUID NOT NULL REFERENCES profiles(id),
  page_number INTEGER,
  content_encrypted TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  unlock_condition TEXT DEFAULT 'next_borrower',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- READING DUELS
CREATE TABLE IF NOT EXISTS duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES profiles(id),
  opponent_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','completed','declined')),
  challenger_pages INTEGER DEFAULT 0,
  opponent_pages INTEGER DEFAULT 0,
  winner_id UUID REFERENCES profiles(id),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOK CLUBS
CREATE TABLE IF NOT EXISTS book_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  book_id UUID REFERENCES books(id),
  created_by UUID REFERENCES profiles(id),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 6,
  discussion_prompts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_club_members (
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

-- FACULTY WISHLISTS
CREATE TABLE IF NOT EXISTS faculty_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  course_name TEXT,
  enrollment_count INTEGER DEFAULT 0,
  priority_score FLOAT GENERATED ALWAYS AS (enrollment_count * 1.5) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','ordered','fulfilled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES profiles(id),
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY HEALTH
CREATE OR REPLACE VIEW inventory_health AS
SELECT 
  b.id,
  b.title,
  b.author,
  COUNT(bc.id) AS total_copies,
  COUNT(bc.id) FILTER (WHERE bc.status = 'available') AS available_copies,
  AVG(bc.condition_score) AS avg_condition,
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

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_wishlists ENABLE ROW LEVEL SECURITY;

-- Students see their own data
DROP POLICY IF EXISTS "users_own_profile" ON profiles;
CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "books_public_read" ON books;
CREATE POLICY "books_public_read" ON books FOR SELECT USING (true);

DROP POLICY IF EXISTS "copies_public_read" ON book_copies;
CREATE POLICY "copies_public_read" ON book_copies FOR SELECT USING (true);

DROP POLICY IF EXISTS "own_transactions" ON transactions;
CREATE POLICY "own_transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_holds" ON holds;
CREATE POLICY "own_holds" ON holds FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_sessions" ON reading_sessions;
CREATE POLICY "own_sessions" ON reading_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_annotations" ON annotations;
CREATE POLICY "own_annotations" ON annotations FOR ALL USING (auth.uid() = author_id OR is_public = true);

DROP POLICY IF EXISTS "own_duels" ON duels;
CREATE POLICY "own_duels" ON duels FOR ALL USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

DROP POLICY IF EXISTS "clubs_read" ON book_clubs;
CREATE POLICY "clubs_read" ON book_clubs FOR SELECT USING (true);

DROP POLICY IF EXISTS "clubs_write" ON book_clubs;
CREATE POLICY "clubs_write" ON book_clubs FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Admins bypass all RLS
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_all_books" ON books;
CREATE POLICY "admin_all_books" ON books FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_all_copies" ON book_copies;
CREATE POLICY "admin_all_copies" ON book_copies FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_all_transactions" ON transactions;
CREATE POLICY "admin_all_transactions" ON transactions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ATOMIC HOLD PLACEMENT RPC
CREATE OR REPLACE FUNCTION place_hold(p_user_id UUID, p_book_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_position INTEGER;
  v_hold_id UUID;
BEGIN
  PERFORM id FROM books WHERE id = p_book_id FOR UPDATE;
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM holds WHERE book_id = p_book_id AND status = 'waiting';
  INSERT INTO holds (user_id, book_id, position, status, expires_at)
  VALUES (p_user_id, p_book_id, v_position, 'waiting', NOW() + INTERVAL '7 days')
  RETURNING id INTO v_hold_id;
  RETURN jsonb_build_object('hold_id', v_hold_id, 'position', v_position);
END;
$$;

-- AUDIT TRIGGER
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, performed_by)
  VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.id, OLD.id), row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_books ON books;
CREATE TRIGGER audit_books AFTER INSERT OR UPDATE OR DELETE ON books FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_copies ON book_copies;
CREATE TRIGGER audit_copies AFTER INSERT OR UPDATE OR DELETE ON book_copies FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_transactions ON transactions;
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- SEED: 30 BOOKS
INSERT INTO books (isbn, title, author, genre, description, published_year, total_pages, tags) VALUES
('9780061965784','The Hobbit','J.R.R. Tolkien','Fantasy','Bilbo Baggins journey to the Lonely Mountain',1937,310,ARRAY['adventure','classic','fantasy']),
('9780743273565','The Great Gatsby','F. Scott Fitzgerald','Classic','The American Dream in the Jazz Age',1925,180,ARRAY['classic','american','social']),
('9780385333481','The Handmaid Tale','Margaret Atwood','Dystopia','A totalitarian theocratic society',1985,311,ARRAY['dystopia','feminist','literary']),
('9780062316097','The Alchemist','Paulo Coelho','Fiction','A shepherds journey to find treasure',1988,208,ARRAY['philosophy','journey','inspirational']),
('9780140283334','Crime and Punishment','Fyodor Dostoevsky','Classic','A student commits murder and faces consequences',1866,545,ARRAY['classic','russian','psychological']),
('9780062498533','Sapiens','Yuval Noah Harari','Non-Fiction','A brief history of humankind',2011,443,ARRAY['history','science','society']),
('9780743477109','1984','George Orwell','Dystopia','A totalitarian surveillance state',1949,328,ARRAY['dystopia','political','classic']),
('9780062457714','Thinking Fast and Slow','Daniel Kahneman','Psychology','Two systems that drive the way we think',2011,499,ARRAY['psychology','cognitive','science']),
('9780385490818','The Power of Habit','Charles Duhigg','Self-Help','Why we do what we do in life and business',2012,371,ARRAY['habits','psychology','business']),
('9780375831003','To Kill a Mockingbird','Harper Lee','Classic','Racial injustice in the American South',1960,281,ARRAY['classic','social','justice']),
('9780385737951','The Hunger Games','Suzanne Collins','YA Dystopia','A televised death tournament in a future society',2008,374,ARRAY['dystopia','ya','adventure']),
('9780743454537','Brave New World','Aldous Huxley','Dystopia','A genetically engineered future society',1932,311,ARRAY['dystopia','classic','science']),
('9780679720201','In Search of Lost Time','Marcel Proust','Classic','A monumental work on memory and time',1913,4215,ARRAY['classic','french','literary']),
('9780553380163','A Brief History of Time','Stephen Hawking','Science','The universe from the Big Bang to black holes',1988,212,ARRAY['science','physics','cosmology']),
('9780316346627','The Catcher in the Rye','J.D. Salinger','Classic','Teenage alienation and identity',1951,277,ARRAY['classic','coming-of-age','american']),
('9780385333498','Flowers for Algernon','Daniel Keyes','Sci-Fi','A mans intelligence surgically boosted then lost',1966,311,ARRAY['scifi','psychology','literary']),
('9780062409850','Atomic Habits','James Clear','Self-Help','Tiny changes for remarkable results',2018,320,ARRAY['habits','productivity','self-help']),
('9780735211292','Little Fires Everywhere','Celeste Ng','Fiction','Secrets in a wealthy Ohio suburb',2017,338,ARRAY['fiction','family','social']),
('9780062690623','Educated','Tara Westover','Memoir','A memoir about family education and self-invention',2018,334,ARRAY['memoir','education','biography']),
('9780374533557','The Stranger','Albert Camus','Philosophy','Existentialism and absurdism in French Algeria',1942,123,ARRAY['philosophy','classic','existential']),
('9780062440761','Deep Work','Cal Newport','Productivity','Rules for focused success in a distracted world',2016,296,ARRAY['productivity','focus','career']),
('9780525559474','The Midnight Library','Matt Haig','Fiction','Infinite possibilities between life and death',2020,304,ARRAY['fiction','magical','hope']),
('9780385737951','Project Hail Mary','Andy Weir','Sci-Fi','An astronaut wakes alone on a spacecraft',2021,476,ARRAY['scifi','space','survival']),
('9780525512820','Normal People','Sally Rooney','Fiction','Connell and Marianne navigate college and love',2018,266,ARRAY['fiction','romance','irish']),
('9780374228866','Pachinko','Min Jin Lee','Historical','A Korean saga spanning four generations',2017,496,ARRAY['historical','korean','family']),
('9780593230572','The Invisible Life of Addie LaRue','V.E. Schwab','Fantasy','A woman cursed to be forgotten by everyone she meets',2020,444,ARRAY['fantasy','historical','romance']),
('9780062678492','Dune','Frank Herbert','Sci-Fi','A desert planet and interstellar politics',1965,896,ARRAY['scifi','classic','epic']),
('9780525651024','The Song of Achilles','Madeline Miller','Historical Fiction','The story of Achilles and Patroclus',2011,369,ARRAY['historical','mythology','literary']),
('9780062301239','Between the World and Me','Ta-Nehisi Coates','Non-Fiction','A letter to his son about being Black in America',2015,152,ARRAY['race','memoir','social']),
('9780143127550','Thinking in Systems','Donella Meadows','Non-Fiction','A primer on systems thinking',2008,240,ARRAY['systems','science','environment'])
ON CONFLICT (isbn) DO NOTHING;

-- SEED: 3 copies per book (run dynamically)
INSERT INTO book_copies (book_id, qr_code, condition_score, status, location_shelf)
SELECT id, 'QR-' || UPPER(SUBSTRING(id::text, 1, 8)) || '-A', 95, 'available', 'Shelf-' || (FLOOR(RANDOM()*10)+1)::text FROM books
UNION ALL
SELECT id, 'QR-' || UPPER(SUBSTRING(id::text, 1, 8)) || '-B', 80, 'available', 'Shelf-' || (FLOOR(RANDOM()*10)+1)::text FROM books
UNION ALL
SELECT id, 'QR-' || UPPER(SUBSTRING(id::text, 1, 8)) || '-C', 65, 'available', 'Shelf-' || (FLOOR(RANDOM()*10)+1)::text FROM books
ON CONFLICT (qr_code) DO NOTHING;

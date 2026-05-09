-- ==========================================
-- WORLD BOOK DATABASE & USER ENGAGEMENT
-- SCALE: 200M+ Records Ready
-- ==========================================

-- 1. EXTEND BOOKS FOR GLOBAL SCALE
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS isbn_13 VARCHAR(13) UNIQUE,
ADD COLUMN IF NOT EXISTS isbn_10 VARCHAR(10),
ADD COLUMN IF NOT EXISTS open_lib_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS pages INTEGER,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS confidence_score FLOAT DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS subjects TEXT[] DEFAULT '{}';

-- 2. EDITIONS TABLE (Multiple versions of a work)
CREATE TABLE IF NOT EXISTS editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    isbn_13 VARCHAR(13) UNIQUE,
    isbn_10 VARCHAR(10),
    publisher TEXT,
    format TEXT, -- 'Hardcover', 'Paperback', 'E-book'
    published_year SMALLINT,
    language VARCHAR(10),
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. USER BOOK INTERACTIONS (Reading Status & Reviews)
CREATE TABLE IF NOT EXISTS user_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('reading', 'completed', 'wishlist', 'dropped')) DEFAULT 'wishlist',
    progress_percentage INTEGER DEFAULT 0,
    rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
    review TEXT,
    notes TEXT, -- Private notes for the student
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, book_id)
);

-- 4. SEARCH HISTORY (Personalization)
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS UPDATES
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own book lists
CREATE POLICY "Users can manage their own book interactions" ON user_books
    FOR ALL USING (auth.uid() = user_id);

-- Allow users to view their own search history
CREATE POLICY "Users can manage their search history" ON search_history
    FOR ALL USING (auth.uid() = user_id);

-- Global books are viewable by everyone
CREATE POLICY "Global books are viewable by everyone" ON books
    FOR SELECT USING (true);

-- Editions are viewable by everyone
CREATE POLICY "Editions are viewable by everyone" ON editions
    FOR SELECT USING (true);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON books(isbn_13);
CREATE INDEX IF NOT EXISTS idx_books_ol_id ON books(open_lib_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_books_user ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_editions_book ON editions(book_id);

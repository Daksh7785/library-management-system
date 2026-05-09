-- ============================================================
-- ACADEMIC OS — UNIVERSAL CONTENT SYSTEM MIGRATION
-- ============================================================

-- ============================================================
-- 1. MEDIA CONTENT (eBooks, Audiobooks, Videos, Papers)
-- ============================================================
CREATE TABLE IF NOT EXISTS media_content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id      UUID REFERENCES libraries(id),
  uploaded_by     UUID REFERENCES profiles(id),
  title           TEXT NOT NULL,
  author          TEXT,
  description     TEXT,
  content_type    TEXT CHECK (content_type IN (
                    'ebook','audiobook','video','paper','novel','lecture'
                  )) DEFAULT 'ebook',
  file_url        TEXT,          -- Supabase Storage URL
  cover_url       TEXT,
  duration_sec    INT,           -- for audio/video
  file_size       BIGINT,
  page_count      INT,
  language        TEXT DEFAULT 'en',
  tags            JSONB DEFAULT '[]',
  category        TEXT,
  isbn            TEXT,
  is_public       BOOLEAN DEFAULT TRUE,
  is_free         BOOLEAN DEFAULT TRUE,
  view_count      INT DEFAULT 0,
  download_count  INT DEFAULT 0,
  rating          NUMERIC DEFAULT 0,
  ratings_count   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_library  ON media_content(library_id);
CREATE INDEX IF NOT EXISTS idx_media_type     ON media_content(content_type);
CREATE INDEX IF NOT EXISTS idx_media_search
  ON media_content USING GIN (to_tsvector('english', title || ' ' || COALESCE(author,'') || ' ' || COALESCE(description,'')));

ALTER TABLE media_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Media Read" ON media_content;
CREATE POLICY "Media Read" ON media_content
  FOR SELECT USING (is_public = TRUE OR library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Media Insert" ON media_content;
CREATE POLICY "Media Insert" ON media_content
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- ============================================================
-- 2. CONTENT PROGRESS (Reading / Listening / Watching)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id      UUID REFERENCES media_content(id) ON DELETE CASCADE,
  library_id      UUID REFERENCES libraries(id),
  progress_pct    NUMERIC DEFAULT 0,      -- 0-100
  current_page    INT DEFAULT 0,
  current_time_sec INT DEFAULT 0,         -- for audio/video
  total_time_sec  INT DEFAULT 0,          -- accumulated listening time
  status          TEXT DEFAULT 'in_progress', -- in_progress | completed | paused
  last_opened_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user    ON content_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_content ON content_progress(content_id);

ALTER TABLE content_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Progress Own" ON content_progress;
CREATE POLICY "Progress Own" ON content_progress FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 3. CONTENT ANNOTATIONS (Highlights + Notes in Reader)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_annotations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id  UUID REFERENCES media_content(id) ON DELETE CASCADE,
  page_num    INT,
  start_pos   INT,
  end_pos     INT,
  highlight   TEXT,
  note        TEXT,
  color       TEXT DEFAULT '#fbbf24',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annotations_content ON content_annotations(content_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user    ON content_annotations(user_id);

ALTER TABLE content_annotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Annotation Own" ON content_annotations;
CREATE POLICY "Annotation Own" ON content_annotations FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 4. AI SUMMARIES (Cached)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_summaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id  UUID UNIQUE REFERENCES media_content(id) ON DELETE CASCADE,
  summary     TEXT,
  key_points  JSONB DEFAULT '[]',
  difficulty  TEXT,
  read_time   INT,           -- estimated minutes
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Summary Read" ON ai_summaries;
CREATE POLICY "Summary Read" ON ai_summaries FOR SELECT USING (TRUE);

-- ============================================================
-- 5. CROSS-CONTENT LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS content_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID REFERENCES media_content(id) ON DELETE CASCADE,
  target_id       UUID REFERENCES media_content(id) ON DELETE CASCADE,
  link_type       TEXT, -- 'related' | 'prerequisite' | 'reference' | 'sequel'
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_id, target_id)
);

ALTER TABLE content_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Links Read" ON content_links;
CREATE POLICY "Links Read" ON content_links FOR SELECT USING (TRUE);

-- ============================================================
-- 6. READING ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  content_id      UUID REFERENCES media_content(id),
  library_id      UUID REFERENCES libraries(id),
  session_start   TIMESTAMPTZ,
  session_end     TIMESTAMPTZ,
  pages_read      INT DEFAULT 0,
  time_spent_sec  INT DEFAULT 0,
  device_type     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON reading_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON reading_analytics(created_at DESC);

ALTER TABLE reading_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Analytics Own" ON reading_analytics;
CREATE POLICY "Analytics Own" ON reading_analytics FOR ALL USING (user_id = auth.uid());

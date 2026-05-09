-- ============================================================
-- ACADEMIC OS — NEXT-GEN FEATURES MIGRATION
-- ============================================================

-- ============================================================
-- 1. KNOWLEDGE PASSPORT (Global Academic Identity)
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_passport (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  library_id   UUID REFERENCES libraries(id),
  global_score NUMERIC DEFAULT 0,
  skills       JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  books_read   INT DEFAULT 0,
  courses_done INT DEFAULT 0,
  public       BOOLEAN DEFAULT TRUE,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passport_user    ON knowledge_passport(user_id);
CREATE INDEX IF NOT EXISTS idx_passport_score   ON knowledge_passport(global_score DESC);

ALTER TABLE knowledge_passport ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Passport Read" ON knowledge_passport;
CREATE POLICY "Passport Read" ON knowledge_passport
  FOR SELECT USING (public = TRUE OR user_id = auth.uid());

-- ============================================================
-- 2. BOOK PERSONALITY ENGINE
-- ============================================================
CREATE TABLE IF NOT EXISTS book_personality (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id           UUID UNIQUE REFERENCES books(id) ON DELETE CASCADE,
  library_id        UUID REFERENCES libraries(id),
  difficulty_level  TEXT CHECK (difficulty_level IN ('beginner','intermediate','advanced','expert')) DEFAULT 'intermediate',
  sentiment_score   NUMERIC DEFAULT 0.5, -- 0=negative, 1=positive
  engagement_score  NUMERIC DEFAULT 0.5, -- 0=low, 1=viral
  completion_rate   NUMERIC DEFAULT 0,
  personality_tags  JSONB DEFAULT '[]',  -- ["Motivational","Challenging","Exam-focused"]
  total_notes       INT DEFAULT 0,
  last_analyzed_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personality_book    ON book_personality(book_id);
CREATE INDEX IF NOT EXISTS idx_personality_library ON book_personality(library_id);

ALTER TABLE book_personality ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Personality Read" ON book_personality;
CREATE POLICY "Personality Read" ON book_personality FOR SELECT USING (TRUE);

-- ============================================================
-- 3. LIVE BOOK HEATMAP (Global Usage Logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS book_usage_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id    UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id),
  library_id UUID REFERENCES libraries(id),
  location   TEXT,         -- city/country string
  lat        NUMERIC,
  lng        NUMERIC,
  action     TEXT DEFAULT 'view', -- view | borrow | search
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_book    ON book_usage_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_usage_created ON book_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_loc     ON book_usage_logs(location);

ALTER TABLE book_usage_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usage Insert" ON book_usage_logs;
CREATE POLICY "Usage Insert" ON book_usage_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Usage Read" ON book_usage_logs;
CREATE POLICY "Usage Read" ON book_usage_logs FOR SELECT USING (TRUE);

-- ============================================================
-- 4. PEER LEARNING MATCHMAKING
-- ============================================================
CREATE TABLE IF NOT EXISTS user_interests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  library_id UUID REFERENCES libraries(id),
  topic_id   UUID REFERENCES topics(id),
  weight     NUMERIC DEFAULT 1.0, -- interaction frequency weight
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS peer_matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id   UUID REFERENCES libraries(id),
  user1_id     UUID REFERENCES profiles(id),
  user2_id     UUID REFERENCES profiles(id),
  match_score  NUMERIC DEFAULT 0,  -- 0-100
  common_books JSONB DEFAULT '[]',
  common_topics JSONB DEFAULT '[]',
  status       TEXT DEFAULT 'suggested', -- suggested | connected | dismissed
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_user    ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1     ON peer_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2     ON peer_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_score     ON peer_matches(match_score DESC);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Interest Own" ON user_interests;
CREATE POLICY "Interest Own" ON user_interests FOR ALL USING (user_id = auth.uid());

ALTER TABLE peer_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Matches Read" ON peer_matches;
CREATE POLICY "Matches Read" ON peer_matches
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- ============================================================
-- 5. SMART STUDY MODE
-- ============================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id        UUID REFERENCES books(id),
  library_id     UUID REFERENCES libraries(id),
  title          TEXT,
  total_chapters INT DEFAULT 1,
  chapters_done  INT DEFAULT 0,
  progress_pct   NUMERIC DEFAULT 0,
  notes          JSONB DEFAULT '[]', -- [{chapter, text, created_at}]
  checkpoints    JSONB DEFAULT '[]', -- [{chapter, completed_at}]
  status         TEXT DEFAULT 'active', -- active | paused | completed
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_book ON study_sessions(book_id);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Study Own" ON study_sessions;
CREATE POLICY "Study Own" ON study_sessions FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 6. UNIVERSAL RESOURCE HUB
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id   UUID REFERENCES libraries(id),
  uploaded_by  UUID REFERENCES profiles(id),
  title        TEXT NOT NULL,
  description  TEXT,
  resource_type TEXT CHECK (resource_type IN ('pdf','video','paper','book','link','audio')) DEFAULT 'pdf',
  url          TEXT,
  file_size    BIGINT,
  thumbnail    TEXT,
  tags         JSONB DEFAULT '[]',
  category     TEXT,
  view_count   INT DEFAULT 0,
  is_public    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_library ON resources(library_id);
CREATE INDEX IF NOT EXISTS idx_resources_type    ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_search  
  ON resources USING GIN (to_tsvector('english', title || ' ' || COALESCE(description,'')));

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Resource Read" ON resources;
CREATE POLICY "Resource Read" ON resources FOR SELECT
  USING (is_public = TRUE OR library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Resource Insert" ON resources;
CREATE POLICY "Resource Insert" ON resources FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- ============================================================
-- 7. PREDICTIVE INTELLIGENCE — Alert Store
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id  UUID REFERENCES libraries(id),
  target_user UUID REFERENCES profiles(id),
  alert_type  TEXT, -- overdue_risk | high_demand | inactivity | recommendation
  message     TEXT,
  metadata    JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  severity    TEXT DEFAULT 'info', -- info | warning | critical
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user    ON ai_alerts(target_user);
CREATE INDEX IF NOT EXISTS idx_alerts_library ON ai_alerts(library_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread  ON ai_alerts(target_user, is_read);

ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alert Own" ON ai_alerts;
CREATE POLICY "Alert Own" ON ai_alerts FOR SELECT
  USING (target_user = auth.uid() OR library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

-- ============================================================
-- PERFORMANCE INDEXES (existing tables supplement)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_status  ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due     ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_books_category       ON books(category);

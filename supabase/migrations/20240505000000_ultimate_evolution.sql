-- =========================================================
-- ULTIMATE EVOLUTION: KNOWLEDGE GRAPH, GAMIFICATION, 
-- SOCIAL+, MARKETPLACE, COLLABORATION, & OFFLINE SYNC
-- =========================================================

-- 1. KNOWLEDGE GRAPH SYSTEM
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE book_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  UNIQUE(book_id, topic_id)
);

CREATE TABLE topic_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(topic_id, skill_id)
);

CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  description TEXT,
  UNIQUE(learning_path_id, step_order)
);

-- 2. GAMIFICATION SYSTEM
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Material icon name
  points_reward INT DEFAULT 10
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  books_read INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SOCIAL + SENTIMENT SYSTEM (EXTENDING NOTES)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'neutral', 'negative'));

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MARKETPLACE SYSTEM
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  price NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'sold', 'cancelled')) DEFAULT 'active',
  condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'completed', 'disputed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. OFFLINE SYNC SYSTEM
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. REAL-TIME COLLABORATION
CREATE TABLE reading_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES reading_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE live_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES reading_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ADVANCED ANALYTICS (BOOK DNA EXTENDED)
CREATE TABLE book_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
  emotional_score NUMERIC DEFAULT 0,
  avg_completion_time INTERVAL,
  popularity_trend JSONB DEFAULT '[]'::jsonb
);

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================
CREATE INDEX idx_book_topics_book ON book_topics(book_id);
CREATE INDEX idx_book_topics_topic ON book_topics(topic_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_sync_queue_user_unsynced ON sync_queue(user_id) WHERE synced = FALSE;
CREATE INDEX idx_live_messages_room ON live_messages(room_id);
CREATE INDEX idx_marketplace_active ON marketplace_listings(status) WHERE status = 'active';

-- =========================================================
-- RLS POLICIES (BASIC)
-- =========================================================
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view learning paths" ON learning_paths FOR SELECT USING (true);
CREATE POLICY "Anyone can view active listings" ON marketplace_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Participants can view room messages" ON live_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM room_participants WHERE room_id = live_messages.room_id AND user_id = auth.uid()));

-- =========================================================
-- DONE 🚀
-- =========================================================

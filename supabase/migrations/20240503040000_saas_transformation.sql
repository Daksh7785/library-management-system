-- Migration for Multi-Tenant SaaS, Social Layer, and Advanced Analytics

-- 1. Libraries (Tenants)
CREATE TABLE IF NOT EXISTS public.libraries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Add library_id to profiles (Multi-tenant Users)
-- Users can theoretically belong to multiple libraries in a true SaaS, 
-- but for simplicity, we map a profile to a primary library.
ALTER TABLE public.profiles ADD COLUMN library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE;
CREATE INDEX idx_profiles_library ON public.profiles(library_id);

-- 3. Add library_id to books and book_copies
ALTER TABLE public.books ADD COLUMN library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE;
CREATE INDEX idx_books_library ON public.books(library_id);

ALTER TABLE public.book_copies ADD COLUMN library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE;
CREATE INDEX idx_copies_library ON public.book_copies(library_id);

-- 4. Add library_id to transactions and holds
ALTER TABLE public.transactions ADD COLUMN library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE;
CREATE INDEX idx_transactions_library ON public.transactions(library_id);

ALTER TABLE public.holds ADD COLUMN library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE;
CREATE INDEX idx_holds_library ON public.holds(library_id);

-- 5. Social Layer
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.feed_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'started_reading', 'finished_reading', 'left_note'
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    copy_id UUID REFERENCES public.book_copies(id) ON DELETE SET NULL,
    content TEXT, -- For notes or reviews
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    feed_event_id UUID REFERENCES public.feed_events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, feed_event_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    feed_event_id UUID REFERENCES public.feed_events(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Advanced Analytics & Book DNA Metrics
ALTER TABLE public.books ADD COLUMN total_reads INTEGER DEFAULT 0;
ALTER TABLE public.books ADD COLUMN avg_read_time_days NUMERIC(5,2);
ALTER TABLE public.book_copies ADD COLUMN peak_usage_month INTEGER;

-- 7. Multi-Tenant RLS Policies
-- We need to restrict users to only see data from their library.

-- Enable RLS on new tables
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's library
CREATE OR REPLACE FUNCTION get_auth_library_id() RETURNS UUID AS $$
  SELECT library_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Libraries: Anyone can view libraries (for signup/selection)
CREATE POLICY "Public can view libraries" ON public.libraries FOR SELECT USING (true);

-- Books: Users can only see books in their library
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
CREATE POLICY "Users view books in their library" ON public.books FOR SELECT 
USING (library_id = get_auth_library_id());

-- Profiles: Users can see profiles in their library
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users view profiles in their library" ON public.profiles FOR SELECT 
USING (library_id = get_auth_library_id());

-- Transactions: Restrict to library
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users view their own transactions" ON public.transactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins view all transactions in library" ON public.transactions FOR SELECT 
USING (
  get_auth_library_id() = library_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feed Events: Users see events in their library
CREATE POLICY "Users view feed in their library" ON public.feed_events FOR SELECT 
USING (library_id = get_auth_library_id());

-- 8. Trigger for Social Feed Automation
-- Automatically insert a feed event when a user issues a book
CREATE OR REPLACE FUNCTION trigger_started_reading_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.feed_events (library_id, user_id, event_type, book_id, copy_id)
    VALUES (NEW.library_id, NEW.user_id, 'started_reading', NEW.book_id, NEW.copy_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_book_issue
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    WHEN (NEW.status = 'issued')
    EXECUTE FUNCTION trigger_started_reading_event();

-- Extend the schema for Social Reading Notes and Living ISBN Module

-- 1. Reading Notes Table
CREATE TABLE IF NOT EXISTS public.reading_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Book Copies Table (Individual physical volumes)
CREATE TABLE IF NOT EXISTS public.book_copies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    condition_score INTEGER DEFAULT 100 NOT NULL,
    rescue_count INTEGER DEFAULT 0 NOT NULL,
    total_readers INTEGER DEFAULT 0 NOT NULL,
    longest_journey TEXT,
    retired_at TIMESTAMPTZ,
    retired_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Copy QR Codes Table
CREATE TABLE IF NOT EXISTS public.copy_qr (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_copy_id UUID REFERENCES public.book_copies(id) ON DELETE CASCADE NOT NULL,
    qr_token TEXT UNIQUE NOT NULL,
    public_url TEXT NOT NULL,
    sticker_printed BOOLEAN DEFAULT FALSE NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Copy Timeline Events Table
CREATE TABLE IF NOT EXISTS public.copy_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_copy_id UUID REFERENCES public.book_copies(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
    note TEXT,
    location_tag TEXT,
    photo_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add missing copy_id to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS copy_id UUID REFERENCES public.book_copies(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.reading_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_qr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_timeline ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Notes are viewable by everyone" ON public.reading_notes FOR SELECT USING (true);
CREATE POLICY "Users can add their own notes" ON public.reading_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Copies are viewable by everyone" ON public.book_copies FOR SELECT USING (true);
CREATE POLICY "Admins can manage copies" ON public.book_copies FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "QR tokens are viewable by everyone" ON public.copy_qr FOR SELECT USING (true);
CREATE POLICY "Admins can manage QR tokens" ON public.copy_qr FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Timeline is viewable by everyone" ON public.copy_timeline FOR SELECT USING (true);
CREATE POLICY "Users can add to timeline" ON public.copy_timeline FOR INSERT WITH CHECK (true); -- Public tracking allowed

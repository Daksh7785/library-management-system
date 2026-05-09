-- Migration for Atomic Holds System

-- 1. Create the holds table
CREATE TABLE IF NOT EXISTS public.holds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(book_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view their own holds" 
ON public.holds FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holds" 
ON public.holds FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Atomic RPC to place a hold and calculate position securely
CREATE OR REPLACE FUNCTION place_hold(p_book_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_position INTEGER;
BEGIN
    -- 1. Prevent duplicate holds
    IF EXISTS (SELECT 1 FROM holds WHERE book_id = p_book_id AND user_id = p_user_id AND status = 'waiting') THEN
        RAISE EXCEPTION 'You are already in the queue for this book.';
    END IF;

    -- 2. Lock the holds table for this book to prevent race conditions
    -- Using PERFORM to acquire row locks on existing holds for this book
    PERFORM 1 FROM holds WHERE book_id = p_book_id FOR UPDATE;

    -- 3. Calculate next position
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_position 
    FROM (
      SELECT row_number() over (ORDER BY created_at ASC) as position 
      FROM holds 
      WHERE book_id = p_book_id AND status = 'waiting'
    ) q;

    -- 4. Insert the hold
    INSERT INTO holds (book_id, user_id, status)
    VALUES (p_book_id, p_user_id, 'waiting');

    RETURN v_position;
END;
$$;

-- Innovation Phase 1: Atomic Transactions & Semantic Search Prep

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Atomic Book Issuing
-- Handles availability check, user limit check, transaction creation, and count updates in one go.
CREATE OR REPLACE FUNCTION public.issue_book_rpc(p_user_id UUID, p_book_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_available INTEGER;
    v_borrowed_count INTEGER;
    v_max_limit INTEGER;
    v_due_days INTEGER := 14;
    v_new_tx_id UUID;
BEGIN
    -- 1. Lock rows for update to prevent race conditions
    SELECT available INTO v_available FROM public.books WHERE id = p_book_id FOR UPDATE;
    SELECT borrowed_count, max_limit INTO v_borrowed_count, v_max_limit FROM public.profiles WHERE id = p_user_id FOR UPDATE;

    -- 2. Checks
    IF v_available <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Book not available');
    END IF;

    IF v_borrowed_count >= v_max_limit THEN
        RETURN jsonb_build_object('success', false, 'error', 'Borrow limit reached');
    END IF;

    -- 3. Perform atomic updates
    INSERT INTO public.transactions (user_id, book_id, due_date, status, returned)
    VALUES (p_user_id, p_book_id, NOW() + (v_due_days || ' days')::INTERVAL, 'issued', false)
    RETURNING id INTO v_new_tx_id;

    UPDATE public.books SET available = available - 1 WHERE id = p_book_id;
    UPDATE public.profiles SET borrowed_count = v_borrowed_count + 1 WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_new_tx_id, 'due_days', v_due_days);
END;
$$;

-- 2. Atomic Book Returning
CREATE OR REPLACE FUNCTION public.return_book_rpc(p_transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
BEGIN
    -- 1. Get and lock transaction
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
    END IF;

    IF v_tx.returned THEN
        RETURN jsonb_build_object('success', false, 'error', 'Book already returned');
    END IF;

    -- 2. Perform atomic updates
    UPDATE public.transactions 
    SET status = 'returned', returned = true, return_date = NOW() 
    WHERE id = p_transaction_id;

    UPDATE public.books SET available = available + 1 WHERE id = v_tx.book_id;
    UPDATE public.profiles SET borrowed_count = GREATEST(0, borrowed_count - 1) WHERE id = v_tx.user_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 3. Add Embedding Column to Books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 4. Vector Match Function
CREATE OR REPLACE FUNCTION match_books (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) RETURNS TABLE (
  id UUID,
  title TEXT,
  author TEXT,
  cover_url TEXT,
  category TEXT,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    books.id,
    books.title,
    books.author,
    books.cover_url,
    books.category,
    1 - (books.embedding <=> query_embedding) AS similarity
  FROM books
  WHERE 1 - (books.embedding <=> query_embedding) > match_threshold
  ORDER BY books.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

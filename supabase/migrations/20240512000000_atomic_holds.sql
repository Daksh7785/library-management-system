-- ==========================================
-- ATOMIC HOLD QUEUE & OVERDUE ESCALATION
-- Phase 3 - Prompts 29 & 32
-- ==========================================

-- 1. HOLD QUEUE TABLE
CREATE TABLE IF NOT EXISTS hold_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('waiting', 'notified', 'fulfilled', 'cancelled', 'expired')) DEFAULT 'waiting',
    queue_position INTEGER,
    placed_at TIMESTAMPTZ DEFAULT now(),
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(book_id, user_id)
);

-- Index for queue position management
CREATE INDEX IF NOT EXISTS idx_hold_queue_book_status ON hold_queue(book_id, status) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_hold_queue_user ON hold_queue(user_id);

-- 2. ATOMIC QUEUE FUNCTION (Prevents Race Conditions)
CREATE OR REPLACE FUNCTION place_hold(p_library_id UUID, p_book_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active_holds INTEGER;
    v_max_holds INTEGER := 5; -- Policy: Max 5 active holds per student
    v_new_position INTEGER;
    v_hold_id UUID;
BEGIN
    -- Check user's current active holds
    SELECT COUNT(*) INTO v_active_holds
    FROM hold_queue
    WHERE user_id = p_user_id AND status IN ('waiting', 'notified');

    IF v_active_holds >= v_max_holds THEN
        RETURN jsonb_build_object('success', false, 'error', 'Maximum active holds reached.');
    END IF;

    -- Atomic insert and position calculation
    -- Lock the rows for this book to prevent race conditions
    PERFORM pg_advisory_xact_lock(hashtext(p_book_id::text));

    -- Calculate the new queue position
    SELECT COALESCE(MAX(queue_position), 0) + 1 INTO v_new_position
    FROM hold_queue
    WHERE book_id = p_book_id AND status = 'waiting';

    -- Insert the hold
    INSERT INTO hold_queue (library_id, book_id, user_id, queue_position)
    VALUES (p_library_id, p_book_id, p_user_id, v_new_position)
    RETURNING id INTO v_hold_id;

    -- Audit log
    INSERT INTO audit_ledger (library_id, table_name, record_id, action, changed_by, new_data)
    VALUES (p_library_id, 'hold_queue', v_hold_id, 'INSERT', p_user_id, jsonb_build_object('queue_position', v_new_position));

    RETURN jsonb_build_object('success', true, 'queue_position', v_new_position, 'hold_id', v_hold_id);
END;
$$;

-- 3. OVERDUE ESCALATION (pg_cron setup placeholder)
-- Requires the pg_cron extension to be enabled in Supabase
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- SELECT cron.schedule(
--   'escalate-overdue-books',
--   '0 2 * * *', -- Run every day at 2:00 AM
--   $$
--     UPDATE transactions
--     SET fine = fine + 1.50
--     WHERE status = 'issued' AND due_date < now()
--   $$
-- );

-- 4. RLS UPDATES
ALTER TABLE hold_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holds" ON hold_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all holds" ON hold_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'librarian')
        )
    );

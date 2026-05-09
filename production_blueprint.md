# Smart Library Management System: Senior Architect Review & Feature Blueprint

*Thinking aloud as a Senior Developer...*

Looking at this project brief, the first thing that hits me is the massive potential of the "Living ISBN" concept. It fundamentally shifts a library from being a static warehouse of paper to a dynamic, social, and living ecosystem. However, from a production standpoint, the biggest gap right now is **data integrity and state management**. The system handles physical assets (books) where concurrency is a real issue. If two students click "Issue" on the last available copy at the same millisecond, what happens? If a copy is lost, how does the system reconcile the catalog? We need robust Postgres RPCs, row-level locks, and atomic operations. The foundation must be unshakeable before we build skyscrapers on top. 

Secondly, from a user experience (UX) perspective, the system needs to leverage the psychological hook of the Living ISBN. We need to create loops of engagement. If a student leaves a note, they should be notified when the next reader replies. The admin needs zero-friction workflows—librarians are typically overworked, so any bulk action, automated notification, or visual cue (like heatmaps or predictive risk) will sell this system instantly. We need to move from a "record-keeping" system to an "active intelligence" system. Let's break down exactly what we need to build to get there.

---

## [AREA 1] STUDENT EXPERIENCE FEATURES

**FEATURE: Atomic Hold Queue System**
*   **LAYER:** Backend / DB / UI
*   **WHO NEEDS IT:** Student
*   **THE REAL PROBLEM IT SOLVES:** Students currently have no way to get a book that is out of stock, leading to frustration and lost engagement.
*   **HOW TO BUILD IT:**
    *   **DB:** Create `holds` table (`book_id`, `user_id`, `position`, `status`). Add an RPC `place_hold(p_book_id, p_user_id)` that uses `FOR UPDATE` on the books table to atomically calculate the next queue position.
    *   **API:** RPC call to `place_hold`.
    *   **UI:** Replace the disabled "Issue" button with a "Join Waitlist" button if `available == 0`. Show `Estimated wait: X days`.
    *   **Test:** Concurrency test—simulate 5 users placing a hold simultaneously, ensure positions are exactly 1-5 without duplicates.
*   **CODE SKELETON:**
    ```typescript
    const joinWaitlist = async (bookId: string, userId: string) => {
      const { data, error } = await supabase.rpc('place_hold', { p_book_id: bookId, p_user_id: userId });
      if (error) throw new Error("Could not place hold");
      return data; // Returns { queuePosition: number, estimatedDays: number }
    }
    ```
*   **EFFORT:** 1 day
*   **PRIORITY:** P0 (critical)

**FEATURE: "Next Reader" Secret Messages**
*   **LAYER:** DB / UI / Security
*   **WHO NEEDS IT:** Student (Innovation)
*   **THE REAL PROBLEM IT SOLVES:** Reading is inherently solitary; this turns the physical book into a magical, asynchronous communication device.
*   **HOW TO BUILD IT:**
    *   **DB:** Add `secret_message` (TEXT, encrypted) and `message_revealed` (BOOLEAN) to the `transactions` table.
    *   **API:** Supabase Edge Function to decrypt the message only if the requesting user is the *current* active borrower of that specific physical copy.
    *   **UI:** On the Living ISBN scan portal, show a glowing envelope. Click to reveal.
    *   **Test:** Verify that users who are NOT the current borrower receive a 403 Forbidden when attempting to decrypt.
*   **CODE SKELETON:**
    ```typescript
    const revealSecret = async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke('reveal-secret', {
        body: { transactionId }
      });
      if (error) return null;
      return data.message;
    }
    ```
*   **EFFORT:** 1 day
*   **PRIORITY:** P1 (high)

## [AREA 2] ADMIN / LIBRARIAN PRODUCTIVITY FEATURES

**FEATURE: Smart Batch Scanning (Inventory Audit)**
*   **LAYER:** UI / Mobile
*   **WHO NEEDS IT:** Admin
*   **THE REAL PROBLEM IT SOLVES:** Physical inventory audits take weeks of manual checking; librarians need a way to scan shelves rapidly.
*   **HOW TO BUILD IT:**
    *   **DB:** Add `last_audited_at` to `book_copies` table.
    *   **API:** REST endpoint / RPC `audit_copies(copy_ids[])` that updates the timestamp for all IDs in the array.
    *   **UI:** A special "Audit Mode" scanner. As the admin scans QR codes rapidly, they append to a local array. A floating action button says "Sync 42 Scans to DB".
    *   **Test:** Scan 10 mocks, disconnect internet, scan 5 more, reconnect, hit sync. Verify offline queue syncs correctly.
*   **CODE SKELETON:**
    ```typescript
    const [scannedQueue, setScannedQueue] = useState<string[]>([]);
    const handleScan = (qrCode: string) => {
       if (!scannedQueue.includes(qrCode)) {
         setScannedQueue(prev => [...prev, qrCode]);
         playBeepSound();
       }
    };
    ```
*   **EFFORT:** 2 days
*   **PRIORITY:** P1 (high)

**FEATURE: Predictive Overdue Heatmap**
*   **LAYER:** AI / DB / UI
*   **WHO NEEDS IT:** Admin
*   **THE REAL PROBLEM IT SOLVES:** Librarians react to overdue books instead of proactively preventing them.
*   **HOW TO BUILD IT:**
    *   **DB:** Create a materialized view `risk_scores` calculating days remaining, user history, and book average return time.
    *   **API:** Supabase standard select from the view.
    *   **UI:** Recharts scatter plot or a colored table column showing risk levels (Green/Yellow/Red).
    *   **Test:** Seed a user with 5 past overdue returns, verify their current active borrow flags as "High Risk".
*   **CODE SKELETON:**
    ```typescript
    // In the Admin Dashboard UI
    const riskColor = riskScore > 80 ? '#ef4444' : riskScore > 50 ? '#eab308' : '#10b981';
    <div style={{ background: riskColor, width: `${riskScore}%` }} className="risk-bar" />
    ```
*   **EFFORT:** 1.5 days
*   **PRIORITY:** P2 (medium)

## [AREA 3] CATALOG & DISCOVERY FEATURES

**FEATURE: pgvector Semantic AI Search**
*   **LAYER:** AI / DB / Backend
*   **WHO NEEDS IT:** Student
*   **THE REAL PROBLEM IT SOLVES:** Users often know *what* a book is about without knowing the exact title or author.
*   **HOW TO BUILD IT:**
    *   **DB:** Enable `vector` extension. Add `embedding vector(1536)` to `books`. Create an IVFFlat index. Create `match_books` RPC using cosine distance `<=>`.
    *   **API:** Edge function that takes user query, calls OpenAI `text-embedding-3-small`, and passes the vector to `match_books`.
    *   **UI:** Update the global Command Palette to toggle between "Exact Match" and "AI Search".
    *   **Test:** Search "magic school boy lightning scar" and ensure Harry Potter is rank 1.
*   **CODE SKELETON:**
    ```typescript
    const semanticSearch = async (query: string) => {
      const { data } = await supabase.functions.invoke('semantic-search', { body: { query } });
      return data.results; // Array of books sorted by similarity
    }
    ```
*   **EFFORT:** 2 days
*   **PRIORITY:** P0 (critical)

**FEATURE: "The Shelf of the Returned"**
*   **LAYER:** Realtime / UI
*   **WHO NEEDS IT:** Student
*   **THE REAL PROBLEM IT SOLVES:** Creates serendipitous, social discovery mirroring the physical "returns cart" at a real library.
*   **HOW TO BUILD IT:**
    *   **DB:** Enable Realtime on `transactions` table.
    *   **API:** Subscribe to `UPDATE` where `returned = true`.
    *   **UI:** A horizontal scrolling carousel on the homepage that prepends books the exact moment another user returns them.
    *   **Test:** Return a book in an incognito admin window, watch it slide into the homepage carousel in the student window automatically.
*   **CODE SKELETON:**
    ```typescript
    supabase.channel('public:transactions')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions', filter: 'returned=eq.true' }, 
      payload => fetchBookAndPrependToShelf(payload.new.book_id))
      .subscribe();
    ```
*   **EFFORT:** 1 day
*   **PRIORITY:** P1 (high)

## [AREA 4] REALTIME & LIVE FEATURES

**FEATURE: Live Availability Streams**
*   **LAYER:** Realtime / UI
*   **WHO NEEDS IT:** Both
*   **THE REAL PROBLEM IT SOLVES:** A student sees "1 available", clicks issue, but it was taken 5 seconds ago, causing a UX error.
*   **HOW TO BUILD IT:**
    *   **DB:** Enable Realtime on `books` table.
    *   **API:** Subscribe to `UPDATE` events on the specific book ID.
    *   **UI:** The `available` number in `BookDetails.tsx` ticks up or down instantly. If it hits 0, the Issue button transitions to disabled immediately.
    *   **Test:** Open two browsers on the same book. Issue on one, watch the other's count drop instantly.
*   **CODE SKELETON:**
    ```typescript
    useEffect(() => {
      const channel = supabase.channel(`book_${bookId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'books', filter: `id=eq.${bookId}` }, 
          (payload) => setAvailable(payload.new.available))
        .subscribe();
      return () => { supabase.removeChannel(channel); }
    }, [bookId]);
    ```
*   **EFFORT:** 0.5 days
*   **PRIORITY:** P1 (high)

**FEATURE: Presence Ghosts (Concurrent Readers)**
*   **LAYER:** Realtime / UI
*   **WHO NEEDS IT:** Student
*   **THE REAL PROBLEM IT SOLVES:** Makes the digital library feel like a physical, populated space.
*   **HOW TO BUILD IT:**
    *   **DB:** N/A (Uses memory-based Presence channels).
    *   **API:** `supabase.channel('book_room').track({ user_id: id })`
    *   **UI:** A glowing badge on the book cover: "3 people viewing this right now".
    *   **Test:** Open 4 tabs, verify the counter goes to 4, close 1, verify it drops to 3.
*   **CODE SKELETON:**
    ```typescript
    const room = supabase.channel(`room:${bookId}`, { config: { presence: { key: userId } } });
    room.on('presence', { event: 'sync' }, () => {
      setViewerCount(Object.keys(room.presenceState()).length);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await room.track({ online_at: new Date().toISOString() });
    });
    ```
*   **EFFORT:** 0.5 days
*   **PRIORITY:** P3 (nice to have)

## [AREA 5] NOTIFICATION & COMMUNICATION FEATURES

**FEATURE: Automated Escalation Pipeline**
*   **LAYER:** DB / Cron / DevOps
*   **WHO NEEDS IT:** Admin
*   **THE REAL PROBLEM IT SOLVES:** Librarians waste hours manually hunting down overdue books and writing emails.
*   **HOW TO BUILD IT:**
    *   **DB:** Enable `pg_cron` in Supabase.
    *   **API:** Create an Edge Function `/notify-overdue` that queries the DB for items overdue by 1, 3, and 7 days, and fires Resend emails with escalating templates.
    *   **UI:** Admin dashboard toggle to pause automated emails.
    *   **Test:** Manually trigger the edge function with a mock date, ensure the Resend test domain captures the outgoing emails.
*   **CODE SKELETON:**
    ```sql
    -- In Supabase SQL Editor
    select cron.schedule('daily-overdue-check', '0 9 * * *', $$
      select net.http_post(url:='https://[PROJECT].supabase.co/functions/v1/notify-overdue', headers:='{"Authorization": "Bearer [KEY]"}'::jsonb);
    $$);
    ```
*   **EFFORT:** 1.5 days
*   **PRIORITY:** P0 (critical)

## [AREA 6] MOBILE & PWA FEATURES

**FEATURE: PWA Scanner Installation**
*   **LAYER:** Mobile / UI
*   **WHO NEEDS IT:** Admin / Student
*   **THE REAL PROBLEM IT SOLVES:** Web-based camera scanners often feel clunky or require permission every time. A PWA feels native.
*   **HOW TO BUILD IT:**
    *   **DB:** N/A.
    *   **API:** `vite-plugin-pwa` configuration.
    *   **UI:** Add a "Install Library App" prompt. Ensure the `@zxing/browser` scanner takes 100vw/100vh when opened.
    *   **Test:** Install on iOS via Safari "Add to Home Screen", ensure it opens standalone without Safari UI and camera permissions persist.
*   **CODE SKELETON:**
    ```typescript
    import { VitePWA } from 'vite-plugin-pwa';
    export default defineConfig({
      plugins: [VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Smart Library', short_name: 'Library', display: 'standalone' } })]
    });
    ```
*   **EFFORT:** 1 day
*   **PRIORITY:** P1 (high)

## [AREA 7] SECURITY & DATA FEATURES

**FEATURE: Immutable Audit Ledger**
*   **LAYER:** DB
*   **WHO NEEDS IT:** System / Admin
*   **THE REAL PROBLEM IT SOLVES:** If a transaction is deleted or altered, there is no history of who did it, leading to inventory disputes.
*   **HOW TO BUILD IT:**
    *   **DB:** Create `audit_logs` table. Add a PostgreSQL trigger on `transactions` and `books` tables `AFTER INSERT OR UPDATE OR DELETE`.
    *   **API:** Triggers handle this entirely natively in Postgres.
    *   **UI:** Admin "System Logs" tab that just reads this table.
    *   **Test:** Delete a transaction, query the `audit_logs` table, verify the exact JSON payload of the deleted row is preserved with the admin's UUID.
*   **CODE SKELETON:**
    ```sql
    CREATE OR REPLACE FUNCTION log_action() RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO audit_logs(table_name, action, record, user_id)
      VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
*   **EFFORT:** 0.5 days
*   **PRIORITY:** P0 (critical)

## [AREA 8] PERFORMANCE & DEVELOPER EXPERIENCE FEATURES

**FEATURE: TanStack Query Data Layer**
*   **LAYER:** Frontend
*   **WHO NEEDS IT:** System
*   **THE REAL PROBLEM IT SOLVES:** Current `useEffect` fetching causes race conditions, double-mounting issues in React 18/19 strict mode, and lacks caching.
*   **HOW TO BUILD IT:**
    *   **DB:** N/A.
    *   **API:** Wrap all `api.ts` functions in `useQuery` and `useMutation`.
    *   **UI:** Replace `isLoading` and `useEffect` with `const { data, isLoading } = useQuery(...)`.
    *   **Test:** Navigate away from BookDetails and back; ensure data serves instantly from cache without a loading spinner.
*   **CODE SKELETON:**
    ```typescript
    export const useBook = (id: string) => {
      return useQuery({ queryKey: ['book', id], queryFn: () => fetchBookById(id) });
    };
    ```
*   **EFFORT:** 2 days
*   **PRIORITY:** P1 (high)

## [AREA 9] ANALYTICS & INSIGHTS FEATURES

**FEATURE: Condition Decay Timeline**
*   **LAYER:** Analytics / UI
*   **WHO NEEDS IT:** Admin
*   **THE REAL PROBLEM IT SOLVES:** Identifies when physical copies are likely to become unusable before a student complains.
*   **HOW TO BUILD IT:**
    *   **DB:** Ensure `copy_timeline` logs the `condition_score` integer on every return.
    *   **API:** Calculate moving average of condition drops.
    *   **UI:** Admin sees a line chart predicting exactly when Copy #A12 will hit 0% condition, allowing proactive re-ordering.
    *   **Test:** Mock 5 returns with dropping condition scores (100 -> 90 -> 80), verify projection hits 0 on the 10th estimated return.
*   **CODE SKELETON:**
    ```typescript
    const predictedFailureDate = calculateLinearRegression(timelineData).findXForY(0);
    ```
*   **EFFORT:** 1 day
*   **PRIORITY:** P2 (medium)

## [AREA 10] LIVING ISBN

**FEATURE: The Thread of Hands (Copy Reincarnation)**
*   **LAYER:** DB / UI
*   **WHO NEEDS IT:** Student (Innovation)
*   **THE REAL PROBLEM IT SOLVES:** When a physical copy is destroyed, its "Living ISBN" history dies. We must preserve its soul.
*   **HOW TO BUILD IT:**
    *   **DB:** Add `previous_copy_id` to `book_copies`.
    *   **API:** Standard recursive CTE (Common Table Expression) in Postgres to fetch the full lineage.
    *   **UI:** When viewing the timeline, if a book was "reincarnated", a glowing bridge appears in the UI linking back to the notes left on the previous physical copy.
    *   **Test:** Mark Copy A lost. Create Copy B linked to Copy A. Verify Copy B's timeline shows Copy A's history in a "Past Life" section.
*   **CODE SKELETON:**
    ```sql
    WITH RECURSIVE copy_lineage AS (
      SELECT id, previous_copy_id FROM book_copies WHERE id = current_id
      UNION
      SELECT bc.id, bc.previous_copy_id FROM book_copies bc
      INNER JOIN copy_lineage cl ON bc.id = cl.previous_copy_id
    ) SELECT * FROM copy_lineage;
    ```
*   **EFFORT:** 1.5 days
*   **PRIORITY:** P0 (Highest leverage innovation)

---

## [D1] PRIORITY MATRIX

| Effort \ Impact | HIGH IMPACT (Do Now) | LOW IMPACT (Do Later) |
| :--- | :--- | :--- |
| **LOW EFFORT** | 1. Atomic Hold Queue System<br>2. Immutable Audit Ledger<br>3. Live Availability Streams | 1. Presence Ghosts<br>2. Condition Decay Tracker |
| **HIGH EFFORT** | 1. pgvector AI Search<br>2. Automated Escalation Pipeline<br>3. TanStack Query Refactor<br>4. The Thread of Hands (Reincarnation) | 1. PWA Scanner Installation<br>2. Smart Batch Scanning (Audit) |

---

## [D2] DATABASE SCHEMA ADDITIONS

```sql
-- 1. Atomic Holds System
CREATE TABLE public.holds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(book_id, user_id)
);

-- 2. Audit Ledger (Immutable)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    record JSONB NOT NULL,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Copy Reincarnation (Self-referential FK)
ALTER TABLE public.book_copies 
ADD COLUMN previous_copy_id UUID REFERENCES public.book_copies(id) ON DELETE SET NULL;

-- 4. Audit Log Trigger Function
CREATE OR REPLACE FUNCTION log_audit_action() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs(table_name, action, record, user_id)
  VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Triggers
CREATE TRIGGER books_audit
AFTER INSERT OR UPDATE OR DELETE ON public.books
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

CREATE TRIGGER transactions_audit
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

-- 6. RLS Policies
ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own holds" ON public.holds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own holds" ON public.holds FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Audit logs are Admin ONLY. No insert/update/delete policies.
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## [D3] FULL-STACK FILE STRUCTURE

```text
/src
  /components
    HoldButton.tsx          # Replaces Issue button when stock is 0
    PresenceBadge.tsx       # Realtime viewer count overlay
    LineageTimeline.tsx     # Renders the recursive copy history
  /hooks
    useBookLive.ts          # TanStack Query + Supabase Realtime subscription
    useHoldQueue.ts         # Manages waitlist positioning
  /pages
    AuditLogs.tsx           # Admin view for the immutable ledger
/supabase
  /functions
    notify-overdue/
      index.ts              # Edge function pinging Resend API
  /migrations
    20240504000000_production_hardening.sql # Contains the DB schemas from D2
```

---

## [D4] THE ONE FEATURE I MUST BUILD FIRST

**The Atomic Hold Queue System via RPC.**
*Why?* Because currently, if a book hits 0 availability, the user journey dies. A library without a waitlist is broken. By using a PostgreSQL RPC, we solve the concurrency problem (two people clicking 'waitlist' simultaneously) entirely in the database layer, bypassing React state race conditions. It fixes a critical bug and enables a massive feature simultaneously.

**FULL IMPLEMENTATION:**

**1. The SQL RPC (Run in Supabase Editor):**
```sql
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
```

**2. The React Component (`src/components/HoldButton.tsx`):**
```tsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

interface HoldButtonProps {
  bookId: string;
  onHoldPlaced: (position: number) => void;
}

export const HoldButton: React.FC<HoldButtonProps> = ({ bookId, onHoldPlaced }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceHold = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('place_hold', {
        p_book_id: bookId,
        p_user_id: user.id
      });
      
      if (error) throw error;
      onHoldPlaced(data as number);
    } catch (err: any) {
      setError(err.message || 'Failed to place hold');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button 
        onClick={handlePlaceHold} 
        disabled={isLoading}
        style={{
          padding: '16px 36px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        <span className="material-symbols-outlined">queue</span>
        {isLoading ? 'Securing Position...' : 'Join Waitlist'}
      </button>
      {error && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>{error}</span>}
    </div>
  );
};
```

**3. Integration in `BookDetails.tsx`:**
```tsx
// Inside your action buttons area
{book.available > 0 ? (
  <button onClick={handleIssue} /* ... existing issue button ... */>
    Issue Volume
  </button>
) : (
  <HoldButton 
    bookId={book.id} 
    onHoldPlaced={(pos) => setToast({ msg: `Waitlist joined! You are position #${pos}.`, ok: true })} 
  />
)}
```

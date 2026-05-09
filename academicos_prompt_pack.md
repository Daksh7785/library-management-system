# AcademicOS — Master Build Prompt Pack

50 production-ready prompts, pre-filled for your exact stack. Paste them into your AI assistant one phase at a time. Each prompt builds on the last.

## Project Spec (paste once before Prompt 1)
APP_NAME: AcademicOS
GOAL: Transform a traditional library into an AI-powered "Living ISBN" academic ecosystem with agentic research intelligence and social physical assets.
USERS: Students, Academic Researchers, Library Admins, Guest/Public visitors
CORE FEATURES:
  - Living ISBN (QR-tagged book copies with recursive reader history)
  - ARIA Planner (6-agent research pipeline)
  - AI Librarian (conversational book discovery)
  - Knowledge Graph (3D visual mapping via React Three Fiber)
  - Secret Messages (async reader-to-reader notes per physical copy)
  - Smart Study Mode (chapter-level progress tracking)
  - Peer Matchmaking (similarity-score study partner suggestions)
  - Predictive Heatmaps (admin usage analytics)
  - Automated Escalation (overdue notifications via Edge Functions + pg_cron)
  - Immutable Audit Ledger (tamper-proof transaction log)
  - Career DNA & Knowledge Passport (cross-platform student journey tracking)
STACK:
  - Frontend: React 19 + Vite 6 (TypeScript), Tailwind CSS 4, Framer Motion, Three.js / React Three Fiber, Recharts
  - Backend: Supabase (PostgreSQL, Auth, Edge Functions, Realtime, pgvector)
  - Search: Meilisearch (keyword) + pgvector (semantic/AI)
  - Hardware: ZXing (QR scanning)
DEPLOY TARGET: Vercel (frontend) + Supabase Cloud (backend + DB + Edge Functions)
AUTH: Supabase Auth (email/password + OAuth), RLS-enforced per role (student / admin / public)
NON-FUNCTIONAL: Multi-tenant SaaS (library_id partitions), atomic transactions (FOR UPDATE locks), optimistic UI, realtime subscriptions, immutable audit log, structured logging, ARIA-grade semantic search

---

## Phase 1: Scope, Architecture & API Contract (Prompts 1–6)

### #01 MVP scope & user flows
Act as a senior product engineer for AcademicOS — a multi-tenant, AI-powered academic library OS.
Based on the Project Spec above, produce:
1. MVP scope: must-have vs nice-to-have, sequenced for a 4-week sprint
2. Key user flows (happy path + edge cases) for:
   - Student borrowing a book (QR scan → checkout → return)
   - Admin managing overdue books via automated escalation
   - ARIA Planner generating a 6-step research plan
   - Public visitor scanning a QR code and viewing "Thread of Hands"
3. Core data objects (entities) and their relationships
Keep output short, actionable, and sprint-ready.

### #02 System architecture map
Design the full system architecture for AcademicOS:
Frontend layers:
  - Pages (30+ views): Admin, Student Dashboard, ARIAPlanner, BookDetails, PublicCopy, KnowledgeGraph, etc.
  - Component tree: 3D badges, RealtimeAvailability, QR scanner, ARIA chat widget
  - State: React Query (server state) + React context (UI state) + Supabase Realtime
Backend (Supabase):
  - PostgreSQL tables with RLS per role (admin / student / public)
  - Edge Functions: notify-overdue, semantic-search, reading-dna
  - pg_cron jobs for automated escalation pipeline
  - Realtime channels for live book availability
  - pgvector for semantic embedding search
Integrations:
  - Meilisearch (keyword search index)
  - ZXing (QR scanning, client-side)
  - Resend API (transactional email via Edge Functions)
Return: bullet-list architecture + ASCII diagram of data flow.

### #03 API contract (REST + RPC)
Design the full API contract for AcademicOS covering both REST endpoints (via Supabase PostgREST) and custom PostgreSQL RPCs:
REST endpoints needed:
  - Books: list (with pagination, search, filters), get-by-id, create, update, soft-delete
  - BookCopies: list per book, get-by-qr-token, create (assigns UUID + QR token), update status
  - Transactions: checkout, return, list by user, list by copy
  - Holds: place, cancel, list queue
  - Users/Profiles: get current (/me), update, list (admin only)
  - SecretMessages: create (encrypted), list for copy (authenticated reader)
  - ContentProgress: upsert chapter progress
  - AuditLedger: list (admin only, immutable)
Custom RPCs (PostgreSQL functions):
  - place_hold(book_copy_id, user_id): atomic queue positioning with FOR UPDATE lock
  - checkout_copy(book_copy_id, user_id): atomic borrow preventing double-checkout
  - reincarnate_copy(old_copy_id, new_copy_id): links life history to new physical copy
For each: method, URL/function name, request shape, response shape, error codes, auth requirement, RLS note.
Use consistent error envelope: { error: { code, message, details } }

### #04 Full database schema (PostgreSQL)
Generate the complete PostgreSQL schema for AcademicOS. Include CREATE TABLE statements, constraints, indexes, and RLS policies.
Required tables:
  - libraries (id, name, settings jsonb, created_at)
  - profiles (id → auth.users, library_id, role: 'admin'|'student'|'guest', full_name, avatar_url, reading_dna jsonb, career_dna jsonb, created_at, updated_at)
  - books (id, library_id, isbn, title, author, description, cover_url, category, embedding vector(1536), metadata jsonb, created_at, updated_at)
  - book_copies (id, book_id, library_id, qr_token uuid UNIQUE, status: 'available'|'borrowed'|'reserved'|'damaged'|'retired', condition, parent_copy_id → book_copies(id) [for reincarnation], created_at, updated_at)
  - transactions (id, book_copy_id, user_id, library_id, type: 'checkout'|'return'|'renewal', checked_out_at, due_at, returned_at, metadata jsonb)
  - holds (id, book_copy_id, user_id, library_id, queue_position int, status: 'active'|'fulfilled'|'cancelled', created_at)
  - secret_messages (id, book_copy_id, from_user_id, content_encrypted text, created_at, revealed_at)
  - content_progress (id, user_id, book_id, chapter text, progress_pct int, last_read_at)
  - audit_ledger (id, library_id, actor_id, action text, table_name text, record_id uuid, old_val jsonb, new_val jsonb, created_at) — append-only, no UPDATE/DELETE via RLS
  - search_history (id, user_id, library_id, query text, results_count int, created_at)
  - peer_matches (id, user_a, user_b, similarity_score float, matched_at)
Include:
  - handle_new_user() trigger syncing auth.users → profiles
  - GIN index on books.embedding for pgvector cosine search
  - Composite indexes for common query patterns (library_id + status, user_id + created_at)
  - RLS policies: admins see all rows in their library; students see own data + public books; public sees only book_copies where status='available'

### #05 Monorepo folder structure
Generate the complete monorepo folder structure for AcademicOS:
/
├── src/
│   ├── pages/          ← 30+ views (Admin.tsx, ARIAPlanner.tsx, BookDetails.tsx, PublicCopy.tsx, KnowledgeGraph.tsx, etc.)
│   ├── components/     ← Reusable UI (3D badges, RealtimeAvailability, QRScanner, ARIAChat, etc.)
│   ├── services/       ← api.ts (40KB+ unified hub), aria.ts, meilisearch.ts, qr.ts, peerMatch.ts
│   ├── hooks/          ← useRealtime.ts, useARIA.ts, useQR.ts, useKnowledgeGraph.ts
│   ├── store/          ← React context for auth, library, UI state
│   ├── types/          ← Shared TypeScript interfaces (Book, Copy, Transaction, ARIAState, etc.)
│   ├── utils/          ← mapBook(), mapCopy(), formatDate(), encrypt/decrypt helpers
│   └── styles/         ← Tailwind config, global CSS, animation variants
├── supabase/
│   ├── migrations/     ← Numbered SQL migration files
│   ├── functions/      ← notify-overdue/, semantic-search/, reading-dna/ (Edge Functions)
│   ├── seed.sql        ← Dev seed data
│   └── config.toml
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json (scripts: dev, build, test, db:migrate, db:seed, db:reset, functions:serve)
Include: exact file contents for vite.config.ts, tailwind.config.ts, and tsconfig.json optimized for this stack.

### #06 Local dev setup checklist
Write a step-by-step local setup guide for AcademicOS (fresh machine):
Prerequisites: Node 20+, Supabase CLI, Docker Desktop, pnpm
Steps:
1. Clone repo + install deps (pnpm install)
2. Environment variables: .env.local template for VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MEILISEARCH_HOST, VITE_MEILISEARCH_KEY, OPENAI_API_KEY (for embeddings), RESEND_API_KEY
3. Start Supabase locally (supabase start) — include how to get local URL + anon key
4. Run migrations (supabase db migrate) + seed (pnpm db:seed)
5. Start Meilisearch via Docker + index books
6. Start frontend (pnpm dev)
7. Serve Edge Functions locally (supabase functions serve)
Common fixes:
  - Port 54321 already in use → kill existing Supabase process
  - pgvector extension missing → supabase db execute "CREATE EXTENSION IF NOT EXISTS vector"
  - Realtime not working → check supabase/config.toml realtime settings
  - ARIA 6-agent pipeline timeout → increase Edge Function timeout in config

---

## Phase 2: Frontend Foundation & UI Flows (Prompts 7–18)

### #07 React + Vite + TypeScript bootstrap
Generate the complete frontend bootstrap for AcademicOS (React 19 + Vite 6 + TypeScript):
1. Routing setup (React Router v6): public routes (PublicCopy, Login, Register) + protected routes (student layout, admin layout) + role-based guards
2. Global layout: Sidebar nav (collapsible), TopBar with search + notification bell + user avatar, main content area with Framer Motion page transitions
3. Supabase client (src/lib/supabase.ts): typed client, auth helpers, realtime subscription manager
4. API client wrapper (src/services/api.ts skeleton): base fetch + mapBook() + mapCopy() snake_case→camelCase mapping layer, error envelope handler
5. Environment config: import.meta.env typed via vite-env.d.ts
6. TailwindCSS 4 setup with custom design tokens (colors, spacing, font: Geist or similar)
7. Framer Motion layout wrapper for page transitions
Return: exact file contents for all files listed above + pnpm install commands.

### #08 Design system & component library
Create the AcademicOS design system — a premium academic-meets-futuristic aesthetic:
Design tokens (tailwind.config.ts):
  - Primary: deep teal (#0F6E56) with electric mint accent (#1D9E75)
  - Surface: warm off-white (#FAFAF8) in light mode, deep navy (#0D1117) in dark mode
  - Typography: Display → "Instrument Serif" (headings), Body → "DM Sans" (UI), Mono → "JetBrains Mono" (ISBN/QR codes)
  - Spacing scale, border-radius scale, shadow scale (subtle, md, glow)
Reusable components to generate (src/components/ui/):
  - Button.tsx (variants: primary, ghost, danger, icon-only; sizes: sm/md/lg; loading state)
  - Input.tsx (with label, helper text, error state, icon slot)
  - Badge.tsx (variants: status colors for available/borrowed/reserved/damaged)
  - Card.tsx (hover lift animation via Framer Motion)
  - Modal.tsx (backdrop blur, spring entry animation)
  - Toast.tsx (success/error/info; auto-dismiss; stacked)
  - Skeleton.tsx (for loading states)
  - Avatar3DBadge.tsx (Three.js floating badge showing student's Reading DNA level — use React Three Fiber)
All components: fully accessible (ARIA labels, focus rings, keyboard nav), dark mode ready.

### #09 All 30+ pages — list & wireframes
List and wireframe all 30+ pages for AcademicOS. For each page provide: route, auth requirement, key components, empty/loading/error states.
Student pages: Dashboard, BookCatalog, BookDetails, MyBorrows, HoldQueue, KnowledgeGraph (3D), ARIAPlanner, AILibrarian, SmartStudy, SecretMessages, CareerDNA, KnowledgePassport, PeerMatchmaking, Profile, Settings
Admin pages: Admin (overview), BookManagement, CopyManagement (QR generation + Living ISBN history), UserManagement, TransactionLog, AuditLedger, PredictiveHeatmap, AnalyticsDashboard, NotificationCenter, SystemSettings
Public pages: PublicCopy (QR portal — Thread of Hands view, no login), Login, Register, ForgotPassword, Landing
Shared components on each page: header, breadcrumbs, loading skeleton, error boundary, empty state illustration.

### #10 State management plan
Design the complete state management strategy for AcademicOS:
Server state (React Query / TanStack Query):
  - Queries: books list, book detail, my borrows, hold queue, ARIA session
  - Mutations: checkout, return, place hold, submit secret message, upsert progress
  - Cache keys strategy, stale time per resource type
  - Optimistic updates for: content progress upsert, secret message send, hold placement
Realtime state (Supabase Channels):
  - Book availability counter: subscribe to book_copies WHERE book_id = X → invalidate React Query cache on change
  - "Who else is viewing this book" presence channel (Supabase Presence API)
  - Hold queue position updates
UI state (React Context):
  - AuthContext (session, profile, role)
  - LibraryContext (library_id, settings)
  - UIContext (sidebar open, active theme, toast queue)
ARIA state (local component state + useReducer):
  - 6-agent pipeline step tracker (idle → planning → researching → synthesizing → drafting → reviewing → complete)
  - Streaming response buffer
Include: custom hooks for each (useAuth, useLibrary, useBook, useARIA, usePresence).

### #11 Auth screens (signup, login, forgot)
Generate auth screens for AcademicOS using Supabase Auth + React + Tailwind CSS 4:
Pages to generate: Login.tsx, Register.tsx, ForgotPassword.tsx
Design: Split-screen layout — left: animated 3D Knowledge Graph preview (React Three Fiber, low-poly book constellation); right: clean form panel.
Login form: email, password, "Remember me", forgot password link, OAuth buttons (Google), form validation (Zod), inline error messages, loading state on submit button.
Register form: full name, email, password (strength meter), role selection (Student / Librarian), library code (validates against libraries table), terms checkbox.
Forgot password: email input → sends Supabase reset email → confirmation state with countdown timer.
After login: redirect to intended destination (preserve URL), set AuthContext, fetch profile + library settings.
All forms: keyboard accessible, error announced via aria-live, no full-page reload on submit.

### #12 Main dashboard & book catalog UI
Generate the Student Dashboard and BookCatalog pages for AcademicOS:
Dashboard (Dashboard.tsx):
  - Hero greeting with student name + current borrow count + overdue alerts
  - "Currently Reading" card with chapter progress bar + Smart Study button
  - "Your Hold Queue" with live position counter (Supabase Realtime)
  - "ARIA Research Sessions" — recent AI planner sessions with status chips
  - "Peer Spotlight" — 3 peer match suggestions with similarity score badges
  - "Recent Activity" timeline (Framer Motion stagger animation)
  - Recharts: borrowing history sparkline (last 6 months)
BookCatalog (BookCatalog.tsx):
  - Dual search: keyword (Meilisearch instant) + AI semantic toggle
  - Filter panel: category, status (available/borrowed), sort (popular, recent, alphabetical)
  - View toggle: grid (cover cards) / list (compact rows)
  - Book card: cover, title, author, availability badge (color-coded), "Quick Reserve" button
  - Infinite scroll pagination
  - Empty state: ARIA suggestion to search differently
Both pages: mobile-first, Framer Motion layout animations, skeleton loading states.

### #13 BookDetails page — Living ISBN UI
Generate the BookDetails.tsx page — the crown jewel of the Living ISBN concept:
Header section:
  - Book cover (with 3D tilt effect on hover via Framer Motion)
  - Title, author, ISBN, category, difficulty level (AI-generated), sentiment score badge
  - RealtimeAvailabilityButton.tsx: live available/borrowed count updated via Supabase Realtime channel. Shows "X available of Y copies". Animate count change.
  - "Borrow" / "Reserve" / "Join Hold Queue" CTA based on availability + user's current borrows
"Thread of Hands" section:
  - Timeline of every reader who held this specific copy (from book_copies reader history)
  - Each entry: avatar, reader name (or "Anonymous"), date range, star rating, short note
  - Framer Motion stagger animation on scroll-in
Copy selection:
  - List of physical copies (each with QR token, condition, status badge)
  - QR scan button (opens ZXing scanner modal)
"Secret Messages" tab:
  - Authenticated readers can leave encrypted notes for the next borrower
  - Existing messages revealed to the current borrower (if they borrowed this copy)
"Knowledge Graph" mini-view:
  - Small Three.js graph showing related books (via pgvector similarity) — click to navigate
Edit mode (for admins): inline editing of book metadata, add copy, retire copy.

### #14 Reusable form builder with Zod
Create a reusable form system for AcademicOS using React Hook Form + Zod:
1. FormField.tsx: wrapper for label, input/select/textarea, helper text, error message (aria-live). Supports: text, email, password, select, textarea, file, toggle.
2. useFormWithZod(schema) hook: wraps React Hook Form + zodResolver, returns { form, onSubmit, isSubmitting, serverError }.
3. Zod schemas (src/schemas/):
   - bookSchema: title, author, isbn (regex), category (enum), description
   - checkoutSchema: copy_id, due_date (min: tomorrow, max: 30 days), notes
   - holdSchema: book_id, user_id
   - profileSchema: full_name, avatar_url, bio, reading_preferences
   - secretMessageSchema: content (max 500 chars), encrypted: true
4. Example usage: implement BookCreateForm.tsx using the above system — shows all field types, real-time validation, server error display, loading state on submit.
All: TypeScript strict mode, no any, accessible.

### #15 Route guards + auth middleware
Implement route protection for AcademicOS:
1. ProtectedRoute.tsx: checks AuthContext session. If unauthenticated → redirect to /login?redirect=. If token expired → refresh via Supabase, retry, then redirect.
2. RoleGuard.tsx: wraps routes requiring specific roles. Usage: <RoleGuard allowedRoles={['admin']}>. If wrong role → show 403 page (not redirect).
3. PublicOnlyRoute.tsx: for /login, /register — redirects authenticated users to /dashboard.
4. Token refresh: Supabase handles refresh automatically, but add a global axios/fetch interceptor that catches 401 → calls supabase.auth.refreshSession() → retries the request once → if still 401 → signs out and redirects.
5. Session restore on page reload: in AuthContext, call supabase.auth.getSession() on mount, subscribe to onAuthStateChange for tab sync.
6. "Reading in progress" guard: if student has an active session in SmartStudy, prompt "Save progress before leaving?" using useBeforeUnload hook.

### #16 Error boundaries & error pages
Add comprehensive error handling to AcademicOS frontend:
1. GlobalErrorBoundary.tsx (class component): catches unexpected render errors. Shows: friendly "Something went wrong in AcademicOS" message + illustration. "Retry" button (calls reset()). "Report to librarian" button (calls sendPrompt with error context). Logs full stack trace to console in dev only.
2. PageErrorBoundary.tsx: lighter per-page boundary, shows inline error card instead of full-page takeover. Used wrapping each <Route>.
3. QueryErrorBoundary: integrates with React Query's error state — display error card with retry for failed data fetches. Show specific messages: "Book not found", "Session expired — please log in", "Library server unreachable".
4. NotFound.tsx (404): animated illustration of a lost book. "Go to catalog" button.
5. Forbidden.tsx (403): "You need to be an admin to view this page."
6. Error logging: in production, capture errors to Supabase audit_ledger (actor_id = current user, action = 'frontend_error', old_val = null, new_val = { message, stack, route }).

### #17 Frontend testing plan
Write the full frontend testing plan for AcademicOS:
Tools: Vitest (unit), React Testing Library (component), Playwright (E2E), MSW (API mocking)
Unit tests (src/utils/__tests__/):
  - mapBook(), mapCopy() — snake_case→camelCase mapping
  - encrypt/decrypt secret message helpers
  - qr token generation validity
Component tests (src/components/__tests__/):
  - RealtimeAvailabilityButton: renders correct count, updates on Supabase channel event (mock)
  - BookCard: renders all variants, checkout CTA fires correct mutation
  - ARIAChat: sends message, shows loading, renders streamed response
  - Auth forms: validation errors, submit success, server error display
Integration tests (src/pages/__tests__/):
  - BookDetails page: full render, "Thread of Hands" loads, checkout flow, 404 handling
E2E (playwright/):
  - Student full flow: login → search book → checkout → return
  - Admin flow: add book → generate QR → assign copy
  - Public flow: scan QR → view Thread of Hands (no login)
Provide 3 sample test files (unit, component, E2E) as complete code.

### #18 Performance optimizations
Implement frontend performance optimizations for AcademicOS:
Code splitting:
  - Lazy-load all 30+ page components via React.lazy + Suspense
  - Split Three.js / React Three Fiber into separate chunk (heavy — ~500KB)
  - Split Recharts separately
  - Prefetch admin routes only when role === 'admin'
Image optimization:
  - Book covers: use Supabase Storage transforms (?width=300&quality=80) in BookCard, full size in BookDetails
  - Implement IntersectionObserver lazy-loading for covers in catalog
Render optimization:
  - Memoize BookCard with React.memo (re-renders only on id/status change)
  - useMemo for Knowledge Graph node calculations (expensive pgvector similarity sort)
  - useCallback for Realtime subscription handlers
Three.js optimization:
  - Dispose geometries and materials on component unmount
  - Use instancedMesh for Knowledge Graph nodes (up to 500 books)
  - Reduce draw calls with merged geometries for edges
Build:
  - Vite config: manualChunks for three, recharts, framer-motion
  - Bundle analysis script (vite-bundle-visualizer)
Provide concrete code changes for each optimization.

---

## Phase 3: Backend, APIs, Auth & Intelligence (Prompts 19–34)

### #19 Supabase project bootstrap
Bootstrap the Supabase backend for AcademicOS:
1. supabase/config.toml: enable pgvector, pg_cron, realtime (all tables), storage buckets (book-covers, avatars), Edge Functions timeout 60s, auth providers (email + Google OAuth)
2. Extensions to enable via migration:
   - CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   - CREATE EXTENSION IF NOT EXISTS "vector";
   - CREATE EXTENSION IF NOT EXISTS "pg_cron";
   - CREATE EXTENSION IF NOT EXISTS "pgcrypto"; (for secret message encryption)
3. Structured logging: every Edge Function logs { timestamp, function_name, user_id, duration_ms, status } as JSON to a function_logs table.
4. Health check endpoint: Edge Function /health → returns { status: 'ok', db: 'ok', realtime: 'ok', timestamp }
5. CORS config: allow requests from VITE_FRONTEND_URL + localhost:5173
6. Global error format for all Edge Functions: { error: { code: string, message: string, details?: any } }
Return: config.toml + migration file + health function code.

### #20 Database connection + repository layer
Implement the complete repository layer in src/services/api.ts for AcademicOS:
Structure:
  - supabase client initialization (typed with Database type from supabase gen types)
  - mapBook(row): DBBook → Book (snake_case to camelCase + computed fields: isAvailable, availableCount)
  - mapCopy(row): DBCopy → BookCopy (includes parentCopyId for reincarnation lineage)
  - mapTransaction(row), mapHold(row), mapProfile(row)
Repository functions (all return typed results, throw on error):
  - books: fetchBooks({ libraryId, search, category, page, limit }), fetchBook(id), createBook(data), updateBook(id, data), softDeleteBook(id)
  - copies: fetchCopiesForBook(bookId), fetchCopyByQRToken(token), createCopy(data), updateCopyStatus(id, status)
  - transactions: checkout(copyId, userId), returnCopy(copyId), fetchMyBorrows(userId)
  - holds: placeHold(copyId, userId) [calls RPC], cancelHold(holdId), fetchHoldQueue(copyId)
  - profiles: fetchCurrentUser(), updateProfile(data)
Include Realtime subscription helpers:
  - subscribeToBookAvailability(bookId, callback): returns unsubscribe function
  - subscribeToPresence(bookId, userId): join/leave presence channel

### #21 Auth implementation (RLS + JWT)
Implement the full auth system for AcademicOS using Supabase Auth:
1. handle_new_user() PostgreSQL trigger (runs on auth.users INSERT):
   - Creates a row in public.profiles with id = NEW.id, library_id from raw_user_meta_data, role from metadata (default 'student')
   - If library_code provided → validate it exists in libraries table; else reject
2. RLS policy breakdown (generate SQL for each):
   - profiles: students can read own row + update own row; admins can read all in library; no delete
   - books: all authenticated users in same library can read; admins can insert/update/delete
   - book_copies: authenticated users can read; admins can insert/update; no one can delete (only soft-retire via status change)
   - transactions: students can read own; admins can read all in library; insert via RPC only
   - holds: students can read own; admins can read all in library; insert via RPC only
   - audit_ledger: admins can read; NO UPDATE/DELETE for anyone (append-only enforced)
   - secret_messages: student can read only if they currently hold that copy (complex policy — generate helper function)
3. JWT claims: show how to add library_id and role to the JWT via Supabase auth hook (custom claims via Edge Function or SQL hook).
4. Session management in frontend: supabase.auth.onAuthStateChange → update AuthContext → handle SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED events.

### #22–27 Full CRUD — all entities
Implement complete CRUD for all AcademicOS entities. For each, provide: SQL RLS policy, TypeScript repository function, validation schema, and example API response.
CREATE (Prompt 22 — Books + Copies):
  - createBook: validates isbn format (13 digits), auto-generates embedding via OpenAI API call in Edge Function, inserts into books, returns full Book object
  - createCopy: generates uuid qr_token, sets status='available', links to book_id and library_id
READ LIST (Prompt 23 — Books + Copies + Transactions):
  - fetchBooks: supports { search, category, status, sort, page, limit }; returns { data: Book[], total: number }; uses Meilisearch for keyword or pg_vector for semantic
  - fetchCopiesForBook(bookId): returns all copies with status + current borrower name (if borrowed) + queue length
  - fetchMyBorrows(userId): returns active transactions with book + copy details, days until due, overdue flag
READ SINGLE (Prompt 24):
  - fetchBook(id): includes copies[], relatedBooks[] (pgvector similarity top 5), threadOfHands (reader history for each copy), secretMessages (if current borrower)
  - 404 handling: throw NotFoundError which maps to { error: { code: 'NOT_FOUND', message: 'Book not found' } }
UPDATE (Prompt 25 — PATCH):
  - updateBook: partial update, validates changed fields only, regenerates embedding if description changed, updated_at auto-set via trigger
  - updateCopyStatus: only admins; validates valid status transitions (available→borrowed only via checkout RPC)
  - Optimistic update pattern in frontend (React Query)
DELETE / RETIRE (Prompt 26):
  - softDeleteBook: sets deleted_at = now(), cascades to copies (status → 'retired')
  - retireCopy: sets status = 'retired', deleted_at = now(); triggers Copy Reincarnation check
  - Copy Reincarnation: if retiring a copy with borrowing history, prompt admin to link a new copy via reincarnate_copy(old_id, new_id) RPC — migrates thread_of_hands and secret_messages to new copy

### #28 Rate limiting, CORS & security headers
Add security layers to AcademicOS:
Edge Function rate limiting:
  - Implement a rate limiter using a Supabase table (rate_limits: key text, count int, window_start timestamptz)
  - Apply to: login attempts (5/min per IP), ARIA Planner requests (10/hour per user), QR scan endpoint (60/min per library)
  - Return 429 with { error: { code: 'RATE_LIMITED', retry_after: seconds } }
CORS configuration (supabase/config.toml + Edge Function headers):
  - Allow-Origin: VITE_FRONTEND_URL only (not * in production)
  - Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
  - Allow-Headers: Authorization, Content-Type, x-library-id
Security headers (add to all Edge Function responses):
  - Content-Security-Policy: restrict to own domain + Supabase + Meilisearch
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: strict-origin-when-cross-origin
Input sanitization:
  - All text inputs: strip HTML via DOMPurify (client-side) + Postgres parameterized queries (server-side)
  - ISBN validation: exact 13-digit regex before DB insert
  - QR token: UUID v4 format validation before lookup
Explain each setting and why it matters for a multi-tenant library SaaS.

### #29 Atomic hold queue & checkout RPCs
Implement the atomic PostgreSQL RPCs that prevent race conditions in AcademicOS:
1. place_hold(p_book_copy_id uuid, p_user_id uuid) RETURNS holds:
   - BEGIN transaction
   - SELECT … FOR UPDATE on book_copies WHERE id = p_book_copy_id (lock the row)
   - Check: user doesn't already have active hold for this copy
   - SELECT MAX(queue_position) + 1 as next_pos from holds WHERE book_copy_id = p_book_copy_id AND status = 'active' — atomic queue positioning
   - INSERT into holds with next_pos
   - Insert into audit_ledger
   - COMMIT
   - Return the new hold row
2. checkout_copy(p_book_copy_id uuid, p_user_id uuid) RETURNS transactions:
   - BEGIN
   - SELECT … FOR UPDATE on book_copies WHERE id = p_book_copy_id AND status = 'available'
   - If no row returned → RAISE EXCEPTION 'copy_unavailable'
   - UPDATE book_copies SET status = 'borrowed'
   - INSERT into transactions (type='checkout', due_at = now() + interval '14 days')
   - Insert into audit_ledger
   - COMMIT
   - Return transaction row
3. reincarnate_copy(p_old_copy_id uuid, p_new_copy_id uuid) RETURNS void:
   - Validate old copy status = 'retired'
   - UPDATE new copy SET parent_copy_id = p_old_copy_id
   - UPDATE secret_messages: set book_copy_id = p_new_copy_id where book_copy_id = p_old_copy_id AND revealed_at IS NULL
   - Insert reincarnation event into audit_ledger
   - COMMIT
Include SQL for all three functions + how to call them from the frontend via supabase.rpc().

### #30 ARIA — 6-agent research pipeline
Implement ARIA (Agentic Research Intelligence Assistant) for AcademicOS:
Architecture: Supabase Edge Function /aria-planner orchestrates 6 sequential AI agents using streaming responses.
Agent pipeline:
  1. ScopeAgent: Parses the student's research topic → produces structured scope (domain, sub-topics, constraints, deadline)
  2. LibraryAgent: Searches AcademicOS catalog (Meilisearch + pgvector) for relevant books + returns annotated reading list
  3. WebAgent: Uses Perplexity API / Brave Search to find recent papers and sources (if ARIA_WEB_SEARCH=true)
  4. SynthesisAgent: Cross-references library results + web sources → produces unified knowledge map
  5. OutlineAgent: Generates a structured research outline (sections, sub-sections, key arguments)
  6. ReviewAgent: Checks outline for gaps, circular logic, and missing citations → suggests next steps
Implementation:
  - supabase/functions/aria-planner/index.ts: orchestrator that calls agents sequentially, streams progress events via SSE
  - State stored per session in aria_sessions table (id, user_id, topic, agent_states jsonb, status, created_at)
  - Frontend hook useARIA(): connects to SSE stream, updates step state in useReducer, shows live agent progress
  - ARIAPlanner.tsx page: 6-step visual progress indicator (Framer Motion), live streaming output per agent, final downloadable research plan
Include: Edge Function code, aria_sessions table SQL, useARIA hook, ARIAPlanner UI skeleton.

### #31 Semantic search — pgvector + Meilisearch
Implement the hybrid search system for AcademicOS:
1. Embedding generation (Edge Function: embed-book):
   - Triggered on book INSERT or description UPDATE
   - Calls OpenAI text-embedding-3-small API with book title + description + category
   - Stores 1536-dim vector in books.embedding column
   - Also indexes the book in Meilisearch (id, title, author, isbn, category, status)
2. Meilisearch index (for keyword search):
   - Index: 'books', searchableAttributes: ['title', 'author', 'isbn', 'description'], filterableAttributes: ['category', 'status', 'library_id'], sortableAttributes: ['created_at']
   - meilisearch.ts service: search(query, filters) → Book[]
   - Instant-search UI: debounce 150ms, highlight matched terms
3. Semantic search (Edge Function: semantic-search):
   - Input: { query: string, library_id: string, limit: number }
   - Embed the query → vector
   - SELECT id, title, 1 - (embedding <=> $query_vector) AS similarity FROM books WHERE library_id = $1 ORDER BY embedding <=> $query_vector LIMIT $2
   - Return books with similarity scores
4. Hybrid strategy in frontend:
   - Default: Meilisearch (fast, instant)
   - "AI Search" toggle: calls semantic-search Edge Function, shows similarity score badges
   - ARIA Librarian: always uses semantic-search + enriches results with ARIA commentary
Include SQL for semantic search function with GIN index, Edge Function code, and frontend toggle UI.

### #32 Overdue escalation — Edge Function + cron
Implement the automated overdue escalation pipeline for AcademicOS:
1. pg_cron job (runs every night at 2 AM UTC):
   SELECT cron.schedule('notify-overdue', '0 2 * * *', $$SELECT net.http_post(url := 'https://.supabase.co/functions/v1/notify-overdue', headers := '{"Authorization": "Bearer "}', body := '{}') $$);
2. Edge Function /notify-overdue (supabase/functions/notify-overdue/index.ts):
   - Query: SELECT t.*, p.email, p.full_name, b.title, bc.qr_token FROM transactions t JOIN profiles p ON p.id = t.user_id JOIN book_copies bc ON bc.id = t.book_copy_id JOIN books b ON b.id = bc.book_id WHERE t.returned_at IS NULL AND t.due_at < now() AND t.library_id = $library_id
   - Tier logic:
     * 1–3 days overdue: send "friendly reminder" email via Resend API
     * 4–7 days: send "urgent notice" email + create in-app notification
     * 7+ days: send "final warning" email + flag transaction as 'escalated' + notify admin via email
   - Log each escalation to audit_ledger
   - Return summary: { processed: N, emails_sent: N, escalated: N }
3. Resend email templates: generate HTML email templates for each tier (friendly / urgent / final)
4. In-app notification: insert into notifications table (user_id, type, message, read: false)
Include: full Edge Function code, pg_cron SQL, Resend API integration, notifications table SQL.

### #33 Reading DNA + Peer Matchmaking
Implement the Reading DNA and Peer Matchmaking systems for AcademicOS:
Reading DNA (Edge Function: reading-dna):
  - Triggered weekly per user (or on-demand)
  - Analyzes: transactions history (categories borrowed, frequency, session lengths from content_progress, secret messages left)
  - Produces a Reading DNA profile: { genres: {category: pct}[], readingSpeed: 'fast'|'medium'|'slow', preferredLength: 'short'|'medium'|'long', researchDepth: 0-100, socialScore: 0-100 (based on secret messages + ratings), streakDays: N }
  - Stores in profiles.reading_dna jsonb field
  - Frontend: CareerDNA.tsx renders this as a radar chart (Recharts) + animated 3D badge (React Three Fiber) showing DNA level
Peer Matchmaking:
  - peer-match Edge Function: for a given user, calculate similarity_score with all other users in same library:
    * Jaccard similarity on borrowed book categories
    * Cosine similarity on reading_dna vectors
    * Bonus score for overlapping ARIA research topics
  - UPSERT into peer_matches table (user_a, user_b, similarity_score)
  - Frontend PeerMatchmaking.tsx: show top 5 peers with match % + shared interests + "Connect" button (sends secret message / opens chat)
  - Run peer matching for all users via pg_cron weekly
Include: Edge Function code, peer_matches table SQL, CareerDNA.tsx skeleton, PeerMatchmaking.tsx skeleton.

### #34 QR / Living ISBN — ZXing integration
Implement the Living ISBN QR system for AcademicOS using ZXing:
1. QR generation (admin side — CopyManagement.tsx):
   - Each book_copy has a qr_token (UUID). QR encodes URL: https://academicos.app/copy/{qr_token}
   - Use qrcode library (npm) to render QR as SVG/PNG in browser
   - Print-ready QR card component: shows book title, copy number, QR code, library logo
   - Bulk QR generation: generate + download ZIP of QR cards for all copies of a book
2. QR scanning (student side — QRScanner.tsx):
   - Uses ZXing (@zxing/browser) to access camera and decode QR
   - On successful scan: navigate to /copy/{qr_token} or trigger checkout modal if user is logged in
   - Error states: camera permission denied, invalid QR (not an AcademicOS token), already borrowed by someone else
   - Haptic feedback on mobile on successful scan (navigator.vibrate)
3. PublicCopy.tsx (unauthenticated view at /copy/{qr_token}):
   - Fetch copy by qr_token (public Supabase query, no auth required, RLS allows available copies)
   - Show: book cover, title, author, status badge, "Thread of Hands" (reader history — names anonymized for non-logged-in users)
   - CTA: "Log in to Borrow" or "Reserve This Copy"
   - If logged in when arriving: show "Checkout This Copy" button
Include: QRScanner.tsx, PublicCopy.tsx, QR generation utility, and ZXing setup instructions.

---

## Phase 4: Database Reliability, Observability & Security (Prompts 35–44)

### #35–36 Migrations workflow + seed data
Set up the complete migrations + seed workflow for AcademicOS:
Migrations workflow:
  - Naming convention: supabase/migrations/YYYYMMDDHHMMSS_description.sql
  - Create: supabase migration new <name>
  - Apply locally: supabase db migrate (or supabase db reset for fresh start)
  - Apply to production: supabase db push (via CI only, never manually)
  - Rollback: each migration must include a -- rollback section with DROP/ALTER REVERT statements
  - Migration checklist: always add RLS policies in same migration as table creation
Seed data (supabase/seed.sql):
  - 1 test library: { id: 'lib-test-1', name: 'Supabase Academy Library' }
  - 3 users: admin@test.com (admin), student@test.com (student), aria@test.com (student)
  - 20 books across 5 categories (CS, Biology, History, Literature, Mathematics) with realistic ISBNs + descriptions
  - 40 book copies (2 per book, mix of available/borrowed)
  - 10 active transactions (5 overdue for testing escalation pipeline)
  - 5 active holds
  - 3 secret messages
  - 10 content_progress entries
  - Run: supabase db reset (applies migrations + seed in order)
Include: seed.sql file with deterministic data (no random UUIDs — use gen_random_uuid() called at specific points for reproducibility).

### #37–38 Indexes, query tuning & DB constraints
Optimize AcademicOS database performance and integrity:
Critical indexes (generate SQL for each + explain why):
  1. books: (library_id, status, created_at DESC) — catalog listing with filters
  2. books: GIN index on embedding (vector_cosine_ops) — semantic search
  3. book_copies: (book_id, status) — available copies lookup per book
  4. book_copies: (qr_token) UNIQUE — QR scan lookup (already unique constraint, ensure index exists)
  5. transactions: (user_id, returned_at) WHERE returned_at IS NULL — active borrows per user
  6. transactions: (due_at, returned_at) WHERE returned_at IS NULL — overdue scan (pg_cron query)
  7. holds: (book_copy_id, status, queue_position) — hold queue ordering
  8. audit_ledger: (library_id, created_at DESC) — admin audit view
  9. peer_matches: (user_a, similarity_score DESC) — top peer suggestions
DB constraints for integrity:
  - book_copies.status: CHECK (status IN ('available','borrowed','reserved','damaged','retired'))
  - transactions: CHECK (type IN ('checkout','return','renewal'))
  - holds.queue_position: CHECK (queue_position > 0) + UNIQUE (book_copy_id, queue_position) where status = 'active'
  - content_progress.progress_pct: CHECK (progress_pct BETWEEN 0 AND 100)
  - profiles.role: CHECK (role IN ('admin','student','guest'))
  - audit_ledger: no UPDATE or DELETE via RLS (append-only enforcement)
Slow queries to watch (provide EXPLAIN ANALYZE templates): book catalog with search + filter + sort combined, Thread of Hands recursive CTE for copy lineage, peer matching similarity calculation.

### #39–40 Audit fields + transaction wrapping
Implement audit fields and safe multi-step operations for AcademicOS:
Audit fields (via PostgreSQL trigger on all tables):
  - created_at: TIMESTAMPTZ DEFAULT now() NOT NULL
  - updated_at: TIMESTAMPTZ DEFAULT now() — auto-updated via trigger set_updated_at()
  - deleted_at: TIMESTAMPTZ (soft delete flag — NULL = active)
  - created_by: UUID REFERENCES auth.users — set from auth.uid() via trigger
  - updated_by: UUID REFERENCES auth.users — updated via trigger
Create reusable trigger: CREATE OR REPLACE FUNCTION set_audit_fields() that sets updated_at = now() and updated_by = auth.uid() on UPDATE.
Apply to: books, book_copies, transactions, holds, profiles.
Immutable audit_ledger trigger:
  - After INSERT/UPDATE/DELETE on books, book_copies, transactions, holds → fire log_to_audit_ledger() trigger
  - Captures: actor_id (auth.uid()), action ('INSERT'/'UPDATE'/'DELETE'), table_name, record_id, old_val (OLD.*::jsonb), new_val (NEW.*::jsonb)
Risky multi-step operation — wrap in transaction:
  - Copy retirement + reincarnation: if admin retires a copy that has active holds, must: (1) cancel all holds, (2) notify hold holders, (3) retire copy, (4) optionally link to new copy — all in one transaction. Show code for the PostgreSQL function + how to call from frontend.

### #41–42 Backup plan + observability
Implement backup strategy and observability hooks for AcademicOS:
Backup plan:
  - Dev: supabase db dump --local > backups/dev_$(date +%Y%m%d).sql (run manually or via pre-commit hook)
  - Staging: Supabase project → Enable Point-in-Time Recovery (PITR), daily snapshots, 7-day retention
  - Production: Supabase PITR (30-day retention), automated weekly full dump stored in Supabase Storage bucket 'backups' (private), test restore quarterly
  - Restore test script: restore dump to a fresh local Supabase project → run smoke tests → verify
Observability:
  1. Structured logging in all Edge Functions: console.log(JSON.stringify({ timestamp, function, user_id, library_id, duration_ms, status_code, error? }))
  2. Log sink: all Edge Function logs → Supabase Log Drains → external (optional: Axiom / Logtail)
  3. Health checks: /health Edge Function → checks DB (SELECT 1), Meilisearch ping, returns { db_ok, search_ok, timestamp, version }
  4. Key metrics to track (via logs-based metrics or Supabase Dashboard):
     - Checkouts per day per library
     - ARIA Planner sessions per day
     - Overdue rate (overdue_transactions / active_transactions)
     - Search latency (keyword vs semantic)
     - Edge Function cold start frequency
  5. Realtime presence dashboard for admins: shows who is currently online in the library app (Supabase Presence)
Include scripts and configuration for all steps.

### #43–44 Security review + smoke test script
Run a full security review and create a smoke test for AcademicOS:
Security review checklist (assess each and provide quick fixes):
  □ Auth: Supabase JWT expiry set to 1 hour, refresh tokens rotated, service role key never exposed to client
  □ RLS: every table has RLS enabled (supabase db lint --level warning catches missing RLS)
  □ Secrets: no env vars in client bundle except VITE_ prefixed public keys; service role key only in Edge Functions
  □ Input: all text inputs sanitized client-side (DOMPurify) + parameterized queries server-side (Supabase client uses prepared statements)
  □ Injection: no raw SQL string interpolation in any Edge Function
  □ Encryption: secret_messages.content_encrypted uses pgcrypto pgp_sym_encrypt — key stored in Supabase Vault (not env var)
  □ Rate limiting: login (5/min), ARIA (10/hr), QR scan (60/min) — implemented in Prompt 28
  □ File uploads: book covers validated for type (image/*) + size (<5MB) + renamed to UUID before storage
  □ Audit: all sensitive actions logged to immutable audit_ledger
  □ Multi-tenant isolation: every query filters by library_id via RLS — verify with cross-tenant test
Smoke test script (node scripts/smoke-test.mjs):
  - Hit /health → assert 200 + { db_ok: true }
  - Register new student user → assert profile created
  - Login → assert JWT received
  - Search books → assert results array
  - Checkout a book → assert transaction created + copy status = 'borrowed'
  - Return book → assert copy status = 'available'
  - Place hold → assert queue_position = 1
  - Scan QR token → assert PublicCopy data returned without auth
  - Trigger overdue function manually → assert emails logged
  - Assert audit_ledger has entries for all above actions
Return complete smoke-test script + security checklist with status and fix for each item.

---

## Phase 5: Deploy, CI/CD & Iteration (Prompts 45–50)

### #45 Containerize + Docker Compose
Create the containerization setup for AcademicOS (frontend only — Supabase is managed):
Dockerfile (frontend):
  - Multi-stage build: Stage 1 (builder): node:20-alpine, pnpm install, pnpm build → Stage 2 (server): nginx:alpine, copy dist/, nginx config for SPA routing (try_files $uri /index.html)
  - Non-root user: USER nginx
  - HEALTHCHECK: CMD wget -qO- http://localhost/health || exit 1
  - Environment: VITE_ vars baked at build time (ARG in Dockerfile), runtime env via nginx env_vars
  - .dockerignore: node_modules, .env.*, supabase/
docker-compose.yml (full local stack):
  services:
    frontend: (build from Dockerfile, port 5173)
    meilisearch: (getmeili/meilisearch:latest, port 7700, volume for data persistence)
    supabase: (use supabase/postgres image for local DB only — note: prefer supabase CLI for full local stack)
Include: nginx.conf for SPA, .dockerignore, docker-compose.yml, and how to run the full local stack with one command (make up or docker compose up).

### #46 Production deploy plan (Vercel + Supabase)
Create the complete production deploy plan for AcademicOS:
Frontend (Vercel):
  - Connect GitHub repo → Vercel project, framework: Vite
  - Build command: pnpm build, output: dist/
  - Environment variables in Vercel dashboard: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MEILISEARCH_HOST, VITE_MEILISEARCH_KEY
  - Custom domain: academicos.app → configure DNS (CNAME → cname.vercel-dns.com)
  - HTTPS: automatic via Vercel
  - Preview deployments for PRs: enabled, uses staging Supabase project
Backend (Supabase Cloud):
  - Production project: new Supabase project (region closest to users)
  - Apply migrations: supabase db push --project-ref <project-id> (from CI only)
  - Deploy Edge Functions: supabase functions deploy --project-ref <project-id>
  - Secrets in Supabase Vault: OPENAI_API_KEY, RESEND_API_KEY, MEILISEARCH_KEY
  - Enable PITR and daily backups
  - pg_cron job: schedule notify-overdue function
Meilisearch (Fly.io or Meilisearch Cloud):
  - Deploy Meilisearch on Fly.io: fly launch with meilisearch image, set MEILI_MASTER_KEY secret
  - Initial index: run supabase/scripts/index-books.mjs to bulk-index all books on first deploy
Checklist: migrations → functions deploy → env vars → domain → smoke test → monitor.

### #47 CI/CD pipeline (GitHub Actions)
Create the GitHub Actions CI/CD pipeline for AcademicOS:
Workflow 1: .github/workflows/ci.yml (on every PR):
  - Setup: pnpm/action-setup, node 20, cache pnpm store
  - Jobs (parallel):
    * lint: pnpm lint (ESLint + TypeScript check)
    * test: pnpm test (Vitest unit + component tests)
    * e2e: install Playwright → start Supabase local → pnpm dev (background) → pnpm playwright test
    * security: run npm audit --audit-level=high; run supabase db lint
  - On failure: post PR comment with failed job summary
Workflow 2: .github/workflows/deploy-staging.yml (on merge to main):
  - Run CI jobs first (needs: [lint, test])
  - Deploy frontend to Vercel preview: vercel deploy --prebuilt
  - Apply DB migrations to staging Supabase: supabase db push --project-ref $STAGING_REF
  - Deploy Edge Functions to staging: supabase functions deploy --project-ref $STAGING_REF
  - Run smoke test against staging
Workflow 3: .github/workflows/deploy-prod.yml (on release tag v*):
  - Require manual approval (environment: production, with protection rules)
  - Apply migrations to production Supabase
  - Deploy Edge Functions to production
  - Deploy frontend to Vercel production: vercel --prod
  - Run smoke test
  - Post Slack notification on success/failure
Secrets needed: SUPABASE_ACCESS_TOKEN, STAGING_REF, PROD_REF, VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, SLACK_WEBHOOK.
Return complete YAML for all 3 workflows.

### #48 Release checklist
Create the AcademicOS release checklist for production deploys:
Pre-release (day before):
  □ All CI checks green on main branch
  □ Migrations reviewed — no destructive changes without deprecation period
  □ Edge Functions tested on staging with production-like data
  □ ARIA pipeline tested end-to-end on staging
  □ pg_cron overdue job tested manually on staging
  □ Smoke test suite passing on staging
Deploy day:
  □ Create GitHub release tag (v1.x.x) with changelog
  □ Announce maintenance window (if DB migration is risky) in in-app banner
  □ Apply migrations to production (via CI, not manually)
  □ Deploy Edge Functions
  □ Deploy frontend (Vercel --prod)
  □ Run smoke test against production
  □ Verify Meilisearch index health
  □ Check Supabase dashboard: Realtime connections, Edge Function logs, DB connections
Post-deploy monitoring (first 30 min):
  □ Watch Supabase logs for errors
  □ Check Vercel analytics for error spike
  □ Verify overdue pg_cron job runs at scheduled time
  □ Check ARIA Planner works end-to-end
Rollback:
  - Frontend: vercel rollback (one command)
  - Edge Functions: redeploy previous version
  - DB migration: run rollback SQL from migration file's -- rollback section
  - Emergency: enable Supabase PITR restore to pre-deploy snapshot

### #49 Reusable: new feature workflow
When I ask you to add a new feature to AcademicOS, always follow this workflow:
1. REQUIREMENTS: Restate the feature in your own words. List edge cases: unauthorized access, concurrent users, empty states, mobile behavior, multi-tenant isolation (does it need library_id filter?).
2. DB CHANGES (if needed): Propose minimal schema changes (new columns / tables / indexes). Write migration SQL. Add RLS policy. Add to audit_ledger trigger if sensitive.
3. BACKEND CHANGES (if needed): New Supabase RPC or Edge Function? Update api.ts repository with typed function. Update mapBook/mapCopy if new fields added.
4. FRONTEND CHANGES: Which pages/components change? New page needed? Update routing. Add React Query query/mutation. Optimistic update pattern if applicable. Mobile-first UI.
5. TESTS: Add Vitest unit test for any new utility/hook. Add React Testing Library test for new component. Add Playwright E2E step to smoke test if core flow.
6. VERIFY LOCALLY: Step-by-step: supabase db migrate → pnpm dev → test the feature manually → run tests → check audit_ledger has entries.
Always: keep multi-tenant library_id isolation, add to audit_ledger, follow existing TypeScript types, use Framer Motion for new animations, respect RLS rules.

### #50 Reusable: production bug debug workflow
When I report a bug in AcademicOS production, always ask for:
GATHER:
  1. Exact error message or behavior (copy from Supabase logs / Vercel logs / browser console)
  2. Steps to reproduce (which page, which user role, which library)
  3. Is it affecting all users or specific library_id? All book types or specific category?
  4. When did it start? (correlate with last deploy tag)
  5. Is the audit_ledger showing the expected entries?
INVESTIGATE:
  1. Check Supabase Dashboard → Logs → Edge Functions (filter by function name + time range)
  2. Check Supabase Dashboard → Logs → PostgREST (for DB-level errors)
  3. Check Vercel logs for frontend errors
  4. Query audit_ledger for the affected record: SELECT * FROM audit_ledger WHERE record_id = '<id>' ORDER BY created_at DESC;
  5. Check if RLS policy is the issue: temporarily test as service role (supabase.rpc with service key in local dev)
  6. For ARIA bugs: check aria_sessions table for stuck agent states
  7. For QR bugs: verify book_copies.qr_token matches scanned value exactly (case-sensitive UUID)
FIX:
  - Propose the minimal safe fix (avoid changing multiple systems at once)
  - For DB bugs: write fix as a new migration (never edit existing migrations)
  - For Edge Function bugs: test fix locally with supabase functions serve
  - For RLS bugs: test with Supabase table editor using different roles
  - Verification: re-run smoke test + specific failing scenario
  - Add regression test so this bug can't recur silently

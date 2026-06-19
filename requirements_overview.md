# AcademicOS — Requirements & Overview

## 1. Project Overview
**AcademicOS** is a next-generation, AI-powered "Living ISBN" academic ecosystem. It is designed to transform a traditional library into a smart, social, and agentic research hub. The system targets Students, Academic Researchers, Library Admins, and Guest/Public visitors.

## 2. Core Functional Requirements (MVP Scope)
Based on the Master Build Prompt Pack, the MVP focuses on these primary features:
*   **Auth & Multi-tenancy:** Role-based access control (Student, Admin, Guest) isolated per `library_id` using Row Level Security (RLS).
*   **Living ISBN Core:** Tracking physical book copies with unique QR codes, recursive reader histories (Thread of Hands), and atomic checkout/hold transactions to prevent race conditions.
*   **Catalog & Hybrid Search:** Keyword search via Meilisearch and semantic/AI search via `pgvector`.
*   **ARIA Planner (Agentic Intelligence):** A 6-agent AI pipeline to help students scope and synthesize research topics.
*   **Automated Escalation:** Nightly `pg_cron` jobs that evaluate overdue books and trigger email notifications via Edge Functions.
*   **Immutable Audit Ledger:** A tamper-proof history of all system transactions.

## 3. Technical Requirements & Stack
*   **Frontend:** React 19, Vite 6 (TypeScript), Tailwind CSS 4, Framer Motion (Animations), React Three Fiber (3D Knowledge Graph).
*   **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Realtime, `pgvector`).
*   **Integrations:** Meilisearch (Search), ZXing (QR Scanning), OpenAI API (Embeddings & ARIA), Resend (Transactional Emails).
*   **Deployment:** Vercel (Frontend), Supabase Cloud (Backend).

---

## 4. Pending Requirements (What I need to proceed)

To fully implement and test the remaining phases (Phase 2 to Phase 5), I have a few requirements and dependencies that need to be fulfilled:

### A. Environment Variables & API Keys
To make the AI, Search, and Email features work, the following keys will need to be provided in a `.env.local` file:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Can be generated locally via `supabase start`).
- `OPENAI_API_KEY`: Required for generating `pgvector` embeddings and powering the ARIA 6-agent pipeline.
- `VITE_MEILISEARCH_HOST` and `VITE_MEILISEARCH_KEY`: Required for the instant keyword search functionality.
- `RESEND_API_KEY`: Required for sending overdue notification emails.

### B. Supabase Environment
- **Local Dev:** Should I set up and initialize the Supabase local environment (`supabase init` and `supabase start`) in the current workspace so we can run migrations and test Edge Functions locally?
- **Cloud Dev:** Or do you already have a remote Supabase project provisioned that we should connect to?

### C. Execution Approval
- We have completed Phase 1 (Scope & Architecture). 
- **Approval:** Do I have your approval to begin generating the code for **Phase 2: Frontend Foundation & UI Flows (Prompts 7–18)**? This will bootstrap the React/Vite app, create the design system, and build the 30+ pages.

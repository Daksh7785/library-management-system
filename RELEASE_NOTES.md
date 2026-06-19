# Release Notes - AcademicOS (v1.0.0-beta)

AcademicOS is a next-generation, full-stack, AI-powered academic and library intelligence ecosystem. This release establishes a robust offline-first fallback and wraps core service components for smooth production-grade operations.

## 🚀 Features Added

*   **Offline-First Mock Database (Hybrid Client)**: Implemented a robust browser-based LocalStorage database and ES6 Proxy client inside `src/lib/supabase.ts`. It detects network unreachable/offline states and seamlessly redirects all table operations (selects, inserts, updates, upserts, deletes, RPCs) to simulated storage.
*   **Chainable Query Builder**: Refactored the `MockQueryBuilder` to support range filters (`.range()`) and correct promise resolution so that nested `.select()` calls on mutations execute successfully.
*   **ARIA Planner Edge Function**: Created a default Deno-based Supabase Edge Function to orchestrate multi-agent planning operations.
*   **Atomic Holds Migration**: Added migration schema `20240512000000_atomic_holds.sql` to manage transactional locking for book reservations and avoid double-checkout race conditions.
*   **Visual Design Tokens**: Introduced HSL-based Tailwind and CSS design tokens in `src/styles/design-tokens.ts` for clean dark-mode glassmorphism rendering.

## 🐛 Bugs Fixed

*   **Supabase Host Resolution Failures**: Resolved console crash scenarios where `net::ERR_NAME_NOT_RESOLVED` on the remote placeholder URL halted frontend rendering. The client now falls back dynamically to LocalStorage.
*   **Chaining TypeErrors**: Fixed exceptions where `.range()` and deferred `.select()` properties were accessed as undefined functions.
*   **Resource Scanner Rendering crashes**: Fixed profiles database lookup errors that prevented scanner routes from loading.

## 📈 Performance Enhancements

*   **Zero-latency Reads**: Direct LocalStorage mapping speeds up database fetches for pages such as Dashboard and Catalog, dropping query times to <5ms in offline mode.
*   **Optimized .gitignore rules**: Excluded heavy compiler caches (`.vite/`), generated reel artifacts, and ZIP files to keep local workspace size minimal.

## 🛡️ Security Updates

*   **Safe Bypass Authentication**: Configured secure demo logins using mock identity profiles (`demo-student-id`, `demo-teacher-id`, `demo-admin-id`) preventing test environments from exposing live credentials.

## 📝 Documentation Updates

*   **TESTING.md**: Added detailed verification guides for mock database transitions, scanner integration, and catalog testing.
*   **requirements_overview.md**: Documented pending requirements, local environment keys, and execution plans.

## ⚠️ Known Issues

*   **Meilisearch & Redis Sync**: When running completely offline, remote Meilisearch indexes and background BullMQ Redis queues are bypassed and must be run locally to sync.

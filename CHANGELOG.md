# Changelog

All notable changes to the AcademicOS library management system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta] - 2026-06-19

### Added
- **feat(database)**: LocalStorage mock fallback database engine to resolve network lookup errors (`net::ERR_NAME_NOT_RESOLVED`) for `aifvxjxuvsfaanbmyaet.supabase.co` in offline or disconnected environments.
- **feat(database)**: Atomic holds database migration `20240512000000_atomic_holds.sql` to secure reservation locks.
- **feat(ai)**: Deno-based Supabase Edge Function orchestration for the ARIA Planner system (`supabase/functions/aria-planner/index.ts`).
- **feat(ui)**: Glassmorphism design tokens under `src/styles/design-tokens.ts`.
- **docs**: `TESTING.md` containing manual and automated verification instructions.
- **docs**: `requirements_overview.md` stating next phase steps and requirements.

### Fixed
- Chaining issues in Supabase JS calls where `.range()` and `.select()` after insertions/updates caused rendering TypeErrors.
- Profile loading crashes on the Scanner `/scanner` interface.

### Refactored
- Updated `.gitignore` rules to isolate build environments (`.vite/`), generated recordings (`generated-reel/`), and archive ZIP files.

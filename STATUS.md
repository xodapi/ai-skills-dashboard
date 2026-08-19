# AI Skills Dashboard, status

**Updated:** 2026-08-19
**Production:** https://ai-skills.syntog.ru, HTTPS enabled

## Production-ready capabilities

- FastAPI, PostgreSQL/TimescaleDB, Redis, Celery Worker/Beat, React 19 and nginx are deployed and healthy.
- GitHub OAuth uses signed, random, 10-minute CSRF state. Production credentials are configured.
- Legal pages and consent links are live: `/privacy`, `/cookies`, `/terms`.
- 16 training modules are available, including **AI-Native Engineering** with five practical exercises and a 15-minute incident-response timer.
- Learner gamification is persistent: XP, predictable levels, daily streaks, server-issued badges and a 91-day activity heatmap.
- Trainer rewards are server-authoritative and idempotent, repeated completion requests do not issue XP twice.
- The read-only administrator dashboard is live:
  - persisted `user`, `moderator`, and `admin` roles;
  - backend-enforced admin APIs for platform metrics and user browsing;
  - pagination, search and read-only user detail;
  - responsive `/admin` and `/admin/users` screens;
  - admin bootstrap restricted to the production `ADMIN_USERNAMES` allowlist.

## Validation completed

- Backend source compilation, Docker builds, Black and Ruff checks on changed backend files.
- Frontend TypeScript and Vite production builds.
- Production health, public route and API smoke checks.
- Production gamification migrations and admin-role migration verified.
- Admin APIs return `401` without authentication and `200` for the configured administrator.
- Dependabot open alerts: **0**.

## Remaining manual action

GitHub OAuth still needs one human end-to-end confirmation:

1. Sign in at https://ai-skills.syntog.ru with GitHub.
2. Confirm the redirect returns to the application and the profile loads.
3. Confirm skill, bookmark and trainer-progress actions work under the real session.
4. For `xodapi`, confirm the **Admin** entry appears after the session refreshes.

This is tracked in GitHub Issue #36. Issue #33 is superseded by #36.

## Known non-blocking items

- The production JavaScript bundle is roughly 1 MB minified. Route-level code splitting is a future performance improvement.
- The repository uses an ESLint 9 package with legacy configuration. The frontend production TypeScript/Vite build is the current reliable validation path.

## Next roadmap candidates

1. Complete the manual OAuth end-to-end test and close Issue #36.
2. Add real code execution in a sandbox with test-case feedback.
3. Add AI review for submitted solutions.
4. Expand trainer content and optional social/leaderboard features.

## Recent releases

- **2026-08-19**: Read-only protected admin dashboard, commit `361d516`.
- **2026-08-18**: Persistent gamification MVP, commit `51499ae`.
- **2026-08-18**: AI-native trainer module, commit `e07031a`.
- **2026-08-18**: OAuth CSRF-state hardening, commit `0c8f0fe`.
- **2026-08-18**: Legal pages and consent links, commit `700d9b0`.

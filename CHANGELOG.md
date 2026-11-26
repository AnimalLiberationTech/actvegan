# Changelog

All notable changes across `actfta-api` (backend) and `actfta` (frontend) are documented here, newest first.

## 2026-11-26

- **Telegram Mini App Auto-Login & Registration (`actfta`, `actfta-api`):**
  - Updated `TelegramAuthAdapter` (`src/adapters/auth/telegram.py`), `TelegramWebAppAuthRequest` (`src/api/request_schemas.py`), and `POST /auth/telegram` (`src/api/routers/auth.py`) to verify Telegram Mini App `initData` strings using `HMAC-SHA256("WebAppData", bot_token)` while retaining backwards-compatible Login Widget verification (`SHA256(bot_token)`).
  - Refactored `useTelegramApp` (`src/hooks/useTelegramApp.js`) to initialize Telegram WebApp context synchronously via `useState` instead of post-render `useRef` mutations, ensuring `App.jsx` detects `isInTelegram` on initial render.
  - Updated `TelegramLogin` (`src/components/TelegramLogin.jsx`) to submit raw `{ init_data }` to `POST /auth/telegram` with cleanup guards, and updated `App.jsx` + `api.js` (`401` interceptor) to recover cleanly on expired tokens without blocking manual logout.
  - Synced `openapi.json` and added unit/router tests in `actfta-api/src/tests/test_telegram_auth.py` and Playwright E2E tests in `actfta/tests/telegram-auto-login.spec.ts`.

## 2026-11-24

- **Sentry Logging & Telemetry (`actfta-api`):**
  - Created `LoggingPort` (`src/ports/logging_port.py`) defining contracts for structured logging (`info`, `warning`, `error`) and exception/message telemetry (`capture_exception`, `capture_message`).
  - Implemented `SentryLoggingAdapter` (`src/adapters/logging/sentry.py`) integrating `sentry-sdk` 3.0 with automatic breadcrumb recording, isolated scope context, and graceful fallback to standard Python logging when Sentry is unconfigured.
  - Added Sentry configuration settings (`sentry_dsn`, `sentry_environment`, `sentry_traces_sample_rate`, `sentry_profiles_sample_rate`) in `Settings` (`src/core/config.py`).
  - Registered `get_logging_adapter` provider in `src/core/dependencies.py` and hooked Sentry initialization into FastAPI startup in `src/api/app.py`.
  - Added unit test suite in `src/tests/test_logging_adapter.py`.

## 2026-11-22

- **Favicon & Asset Cleanup (`actfta`):**
  - Removed template boilerplate icons (`react.svg`, `vite.svg`, `hero.png` from `src/assets/` and `favicon.svg` from `public/`).
  - Integrated custom favicons from `src/assets/favicon/` into `public/` and `index.html` (`favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`, `site.webmanifest`).
- **Replaced `python-jose` with `PyJWT` (`actfta-api`):**
  - Migrated JWT token generation and verification from deprecated `python-jose` to actively maintained and secure `PyJWT` (`pyjwt>=2.9.0`) addressing vulnerabilities including CVE-2026-85394.
  - Updated `src/core/security.py` and `src/adapters/auth/jwt.py` to use `jwt` and `PyJWTError`.
  - Replaced deprecated `datetime.utcnow()` with timezone-aware `datetime.now(UTC)` in token creation.
- **Dependency Cleanup (`actfta-api`):**
  - Audited `pyproject.toml` dependencies and removed 26 unused / transitive dependencies (`passlib`, `email-validator`, `python-multipart`, `dnspython`, `annotated-doc`, `pygments`, plus transitive packages cleanly managed by uv).
  - Retained the 12 actual direct project dependencies.
- **Consistent Telegram Bot Token Env Var (`actfta`, `actfta-api`):**
  - Standardized environment variable naming to `TELEGRAM_BOT_TOKEN` consistently across frontend and backend.
  - Renamed legacy `TG_BOT_API_TOKEN` to `TELEGRAM_BOT_TOKEN` in `.env`, `.env.example`, `README.md`, and `AGENTS.MD`.
  - Added `validation_alias=AliasChoices(...)` in `actfta-api`'s `Settings` (`src/core/config.py`) to support `TELEGRAM_BOT_TOKEN` natively while retaining backward-compatibility for legacy environments.

## 2026-11-21

- **Telegram Mini App Integration (`actfta`):**
  - Added `src/hooks/useTelegramApp.js`: initializes `window.Telegram.WebApp`, signals `ready()` and `expand()`, exposes `isInTelegram`, `tgUser`, `initData`, `themeParams`, and syncs Telegram's native theme colors to CSS custom properties.
  - Added `src/components/TelegramLogin.jsx`: auto-authenticates users opening the app inside Telegram via `POST /auth/telegram`, using `initData` parsed from `window.Telegram.WebApp`.
  - Updated `src/App.jsx`: detects Telegram WebApp context via `useTelegramApp()` and shows `TelegramLogin` before the normal auth flow; prevents login loop via `tgAuthDone` state.
  - Updated `src/main.jsx`: added `basename={import.meta.env.BASE_URL}` to `BrowserRouter` for correct sub-path routing on GitHub Pages.
  - Updated `index.html`: added `https://telegram.org/js/telegram-web-app.js` script (before React bundle), set page title to `Act Vegan`.
  - Fixed `src/services/api.js`: replaced hardcoded `http://127.0.0.1:8000` base URL with `import.meta.env.VITE_API_URL`; added `telegramAuth(payload)` method for `POST /auth/telegram`.
  - Fixed `src/pages/Login.jsx` and `src/pages/Register.jsx`: replaced hardcoded API URLs with `import.meta.env.VITE_API_URL`.
  - Fixed `vite.config.js`: added `base: process.env.GITHUB_ACTIONS ? '/actfta/' : '/'` for GitHub Pages deployment.
  - Fixed `.github/workflows/deploy.yml`: replaced broken `npm run export` + `out/` with `npm run build` + `dist/`; added `cp dist/index.html dist/404.html` for SPA routing; passes `VITE_API_URL` from repository secret.

## 2026-11-19

- **Documentation Refactoring (`AGENTS.MD`, `README.md`, `CHANGELOG.md`):**
  - Updated documentation policy: maintain a single common `CHANGELOG.md` across both `actfta` and `actfta-api`.
  - Decoupled and refactored `AGENTS.MD` and `README.md` across both repositories to be repo-specific, keeping them synchronized by retaining only key integration information about the sibling repository while dedicating internal details to their respective domain (React 19 SPA for `actfta` and FastAPI Hexagonal backend for `actfta-api`).

## 2026-11-13

- **Telegram Auth Adapter (`src/adapters/auth/telegram.py`, `src/api/routers/auth.py`):**
  - Added `TelegramAuthAdapter` implementing `AuthPort` with the official Telegram Login Widget HMAC-SHA256 verification flow: `secret_key = SHA256(bot_token)`, `HMAC-SHA256(data_check_string, secret_key)` compared constant-time against the payload `hash`, plus `auth_date` age enforcement (default 24 h, configurable via `max_age_seconds`).
  - On first login a `DISABLED` user is auto-created with synthetic email `telegram:<id>@tg` and display name from Telegram's `first_name`/`last_name`/`username`; subsequent logins return the existing account.
  - Added `POST /auth/telegram` endpoint, `TelegramAuthRequest` Pydantic schema, `get_telegram_auth_adapter` DI factory, and 18 unit + router integration tests.

## 2026-11-03

- **Tools & Skills DB Tables and Admin RBAC (`src/domain/user.py`, `src/domain/task.py`, `src/domain/policies.py`, `src/services/`, `src/api/routers/`):**
  - Replaced `Tool` and `Skill` enums with dedicated `SQLModel(..., table=True)` entities (`tools` and `skills` tables with `id`, unique `name`, `description`, `created_at`, `updated_at`) and many-to-many link tables (`user_tools`, `user_skills`, `task_tools`, `task_skills`).
  - Added `can_manage_tools` and `can_manage_skills` policies in `src/domain/policies.py` plus `ToolService`, `SkillService`, `/tools`, and `/skills` routers enforcing that only `admin` and `super_admin` users may create, update, or delete tools and skills.
- **Documentation & AI Context (`AGENTS.MD`, `README.md`, `CHANGELOG.md`):**
  - Authored shared [AGENTS.MD](AGENTS.MD) synthesizing architecture, environments, RBAC policies, Python 3.14 + SQLModel gotchas, and active `big-refactor` WIP notes from Antigravity, GitHub Copilot, JetBrains AI Assistant, and Junie histories across `actfta-api` and `actfta`.
  - Replaced legacy template/Trello-only READMEs with a unified full-stack [README.md](README.md) covering both repositories, local `uv` + Vite setup, RBAC role matrix, active REST endpoints, Trello `actfta` pseudo-tags, testing, and Appwrite Cloud (`python-3.14`) deployment.

## 2026-10 — 2026-11 (`big-refactor` branch)

- **Backend (`actfta-api`):**
  - Migrated local persistence and auth defaults to `SqliteAdapter` (`db/tasks.db`, shared on `app.state.db_adapter` with automatic column migrations) + `SqliteAuthAdapter` / `JwtAuthAdapter` (HS256 JWT + raw `bcrypt` on Python 3.14).
  - Split `src/domain/` into dedicated modules (`task.py`, `user.py`, `user_task.py`, `auth.py`, `policies.py`, `pseudo_tags.py`) with RBAC policies (`UserType`: `disabled`, `user`, `admin`, `super_admin`), `ensure_super_admin` startup seeding, case-insensitive `Skill`/`Tool` enums, and task assignment capability checks (`409` on unmet skills/tools).
  - Added `TelegramAdapter` + `NotificationService` for Bot API event notifications and upgraded Appwrite adapter to SDK `24.0.0` (`TablesDB`).
- **Frontend (`actfta`):**
  - Built layered React 19 + Vite 8 + Tailwind CSS v4 SPA (`models/` → `services/` → `hooks/useTasks`), synced against `openapi.json`.
  - Added public pages (`/`, `/stats`, `/donate` with `Noise` grain overlay and `SlideCommit` interactive CTA), role-gated `/dashboard` and `/admin` (`AdminDashboard` with advanced `TaskForm` and user enable/disable controls), unified light/dark CSS theme tokens (`Neucha` display font), and Vite terminal login API logging (`/__login-api-log`).

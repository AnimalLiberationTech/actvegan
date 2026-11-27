# SYSTEM CONTEXT: ActVegan Frontend (`actfta`)

> [!CAUTION]
> - **Keep API contracts synchronized across both repos:** 
>   - If routes or Pydantic schemas change in `actfta-api`, re-export `http://127.0.0.1:8000/openapi.json` to `openapi.json` and update `src/models/` + `src/services/` in lockstep.
>   - If backend policies change in `../actfta-api/src/domain/policies.py`, update `src/models/policies.js` accordingly.
> - **NEVER commit or log secrets:** Keep tokens, passwords, and sensitive credentials out of version control, client-side bundles, and log statements.
> - **Preserve auth-gated route boundaries:** Do not bypass `userReady` or role checks (`disabled`, `user`, `admin`, `super_admin`) when routing in `src/App.jsx`.

## 1. INFRA & STACK
- **Project Identity:** **ActVegan (`actFTA`) Frontend** — activist action & task coordination platform (Vegetarian Union of Moldova / `AnimalLiberationTech`).
- **Two-Directory Workspace (`~/projects/vegan/`):**
  - **Frontend (`actfta`):** Current repository — React 19 SPA (`actfta-frontend`).
  - **Backend (`actfta-api`):** Sibling repository (`/Users/am/projects/vegan/actfta-api`). Provides Hexagonal REST API, SQLite/Appwrite DB, and JWT auth. For backend internals, see `../actfta-api/AGENTS.MD`.
- **Frontend Stack:**
  - **Framework & Tooling:** React `19.2`, Vite `8.0`, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7 (`react-router-dom`).
  - **Data Fetching & State:** Axios `1.15` (centralized in `src/services/api.js`), custom React hooks (`src/hooks/useTasks.js`).
  - **UI & Animation:** Motion (`motion/react`), Hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`), local display font `Neucha` (`src/assets/fonts/NeuchaExtended-Regular.woff2`).
  - **Testing & Quality:** ESLint 9 (`eslint.config.js`), Playwright E2E (`@playwright/test`, `playwright.config.ts`).
- **Key Backend Stack & Integration Info:**
  - Python `3.14`, FastAPI `0.141.1`, Uvicorn, SQLModel + SQLite (`tasks.db`) / Appwrite Cloud Frankfurt (`TablesDB`).
  - Auth: HS256 JWT (60-min expiry), Bearer token scheme.

## 2. ENVIRONMENTS
- **Local Development:**
  - **Frontend SPA:** `http://localhost:5173` (`npm run dev` in `actfta/`). Dev login logs are piped to Vite terminal via `loginApiLogger()` plugin (`/__login-api-log`).
  - **Backend API:** `http://127.0.0.1:8000` (`uv run uvicorn src.api.app:app --reload --host 0.0.0.0 --port 8000` in `../actfta-api`). Swagger UI at `/docs`, OpenAPI schema at `/openapi.json`.
  - **Contract Snapshot:** `actfta/openapi.json` exported from backend `GET /openapi.json`.
- **Environment Variables (`actfta/.env`):**
  - `VITE_API_URL` — Base URL of the backend API (defaults to `http://127.0.0.1:8000` in dev, `https://api.act.vegan.md` in production).
- **Key Backend Environment Context:**
  - Initial super-admin seeded on backend startup: `email="super-admin"`, `display_name="Super Admin"` (configured by backend `SUPER_ADMIN_PASS`).
  - CORS in `actfta-api` currently permits `*` for local development.

## 3. KNOWN CONFIGS & PATCHES
- **Frontend Layering:**
  - **Transport Layer (`src/services/api.js`):** Axios client attaching `Authorization: Bearer <token>` from `localStorage.token`. Clears token and reloads on `401 Unauthorized`.
  - **Service Layer (`src/services/`):** `taskService.js`, `userService.js` encapsulating API calls.
  - **Domain / Model Layer (`src/models/`):** `Task.js` (`createTask`, `toTaskCreatePayload`, `toTaskUpdatePayload`), `User.js` (`createUser`). Normalizes backend payloads for React UI state.
  - **Hook Layer (`src/hooks/useTasks.js`):** Manages task lists, filters, creation, toggling, and optimistic UI updates.
- **Auth-Gated Routing & Roles (`src/App.jsx`):**
  - App waits for `GET /users/me` (`userReady`) before determining role landing routes.
  - `disabled`: Default state for self-registered users awaiting admin approval. Redirected from action features until enabled.
  - `user`: Land on `/dashboard` (personal activist task creation and list).
  - `admin` / `super_admin`: Land on `/admin` (`AdminDashboard.jsx` with advanced `TaskForm` and user enable/disable controls gated by `canChangeUserType` in `src/models/policies.js`).
  - Public routes: `/` (`Home.jsx` with `<Noise />` canvas, `<SlideCommit />` CTA), `/stats`, `/donate`.
- **Styling & Theme (`src/index.css`):**
  - Tailwind CSS v4 (`@import "tailwindcss";`).
  - Light/Dark theme via CSS custom properties on `:root` and `:root.dark`, persisted in `localStorage.theme`.
  - Typography: `Neucha` font used for display titles and branding.
- **Key Backend RBAC & Task Policies (Frontend Impact):**
  - **Policy Source of Truth:** Always inspect and rely on `../actfta-api/src/domain/policies.py` for user authorization rules when building or updating role checks, admin controls, or task/resource permissions. Treat frontend checks as UX hints only—the backend enforces all policies and may return `403`/`409`.
  - **User Type / Role Changes (`can_change_user_type`):** No user may change their own `user_type`. `super_admin` may change any other user's type; `admin` may change any other user's type except a `super_admin`'s; regular `user` and `disabled` accounts cannot change user types.
  - **Task Visibility (`can_create_public_task`, `can_create_task`, `can_change_task_visibility`):** Only `admin` and `super_admin` may create `public` tasks or modify visibility; regular `user` may only create `private` tasks.
  - **Tools & Skills Management (`can_manage_tools`, `can_manage_skills`):** Only `admin` and `super_admin` may create, update, or delete tools and skills.
  - **Skills & Tools Assignment:** Assigning users to tasks (`POST /tasks/{task_id}/assign/{user_id}`) requires matching required `skills` and `tools`; returns HTTP `409` (`AssignmentRequirementsNotMet`) if requirements are not met.
- **Telegram Mini App Auth (`src/hooks/useTelegramApp.js`, `src/components/TelegramLogin.jsx`):**
  - `useTelegramApp` **must initialize synchronously** via `useState(readTelegramContext)` — not `useEffect`. Using `useEffect` causes `isInTelegram` to be `false` on first render, skipping the Telegram gate entirely.
  - `isInTelegram` requires **both** `initData` truthy AND `tgUser` non-null. Outside Telegram, `window.Telegram.WebApp` is defined by the SDK but `initData === ""`.
  - `TelegramLogin` sends `{ init_data: initData }` (the raw URL-encoded string) to `POST /auth/telegram`. The backend discriminates Mini App vs Login Widget payloads by presence of the `init_data` key.
  - `sessionStorage.tgAuthDone` guards the auto-login gate across React Router navigations. Set it in `TelegramLogin.onLogin` / `onFallback`; the 401 interceptor in `api.js` clears it (`sessionStorage.removeItem("tgAuthDone")`) so token expiry forces re-auth.
  - `GET /users/me` returns `display_name` — use `result.data.display_name || result.data.email` for the navbar username (not just `email`).
  - Backend domain error format: `{ detail: { error_code, message } }`. Extract: `detail?.message` → `detail` (string) → `error.message`.
  - Playwright E2E tests: `tests/telegram-auto-login.spec.ts`. Tests spin up their own Node HTTP server over `dist/`; no `webServer` entry in `playwright.config.ts` needed.
- **Active Frontend WIP & Known Issues:**
  - Frontend repo git repository setup (currently a standalone sibling directory).
  - `logo.png` is 1.46 MB — optimize before production deployment.

## 4. TOOLING GOTCHAS
- **Common `CHANGELOG.md`:** Keep only a single common `CHANGELOG.md` synchronized across both repos (`actfta` and `actfta-api`), newest entries first.
- **Cross-Repo Docs Focus:** `AGENTS.MD` and `README.md` are repo-specific and kept in sync only in the sense that they contain key integration info about the sibling repo; deep internal implementation details belong in the respective repo's docs.
- **Keep API contracts synchronized:** Whenever routes or Pydantic schemas change in `actfta-api`, re-export `http://127.0.0.1:8000/openapi.json` to `openapi.json` and update `src/models/` + `src/services/` in lockstep.
- **Frontend Tooling:** Use Node.js `>= 20` and `npm`. Run `npm run dev` for dev server, `npm run build` for production bundle verification, `npm run lint` for ESLint, and `npx playwright test` for E2E tests.
- **Login API Contract:** `POST /auth/login` expects JSON `{"email": "...", "password": "..."}` and returns `{"token": "...", "user_id": "...", "email": "..."}`.
- **Telegram Auth API Contract:** `POST /auth/telegram` accepts two shapes — Mini App: `{"init_data": "<url-encoded-string>"}`, Login Widget: `{"id", "first_name", "auth_date", "hash", ...}`. Backend auto-discriminates by presence of `init_data`. On success returns the same `{"token", "user_id", "email"}` shape as login.
- **Multi-Repo Sandboxes:** When running AI agents across both repositories, ensure access to both `~/projects/vegan/actfta` and `~/projects/vegan/actfta-api`.

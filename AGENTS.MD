# SYSTEM CONTEXT: ActVegan Frontend (`actfta`)

> [!CAUTION]
> - **Keep API contracts synchronized across both repos:** whenever routes or Pydantic schemas change in `actfta-api`, re-export `http://127.0.0.1:8000/openapi.json` to `openapi.json` and update `src/models/` + `src/services/` in lockstep.
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
  - `admin` / `super_admin`: Land on `/admin` (`AdminDashboard.jsx` with advanced `TaskForm` and user enable/disable controls; UI disable button restricted to `super_admin`).
  - Public routes: `/` (`Home.jsx` with `<Noise />` canvas, `<SlideCommit />` CTA), `/stats`, `/donate`.
- **Styling & Theme (`src/index.css`):**
  - Tailwind CSS v4 (`@import "tailwindcss";`).
  - Light/Dark theme via CSS custom properties on `:root` and `:root.dark`, persisted in `localStorage.theme`.
  - Typography: `Neucha` font used for display titles and branding.
- **Key Backend RBAC & Task Policies (Frontend Impact):**
  - Task Visibility: Only `admin` and `super_admin` may create `public` tasks or modify visibility; regular `user` may only create `private` tasks.
  - Skills & Tools: Assigning users to tasks (`POST /tasks/{task_id}/assign/{user_id}`) requires matching required `skills` and `tools`; returns HTTP `409` (`AssignmentRequirementsNotMet`) if requirements are not met.
- **Active Frontend WIP & Known Issues:**
  - Migrate hardcoded `http://127.0.0.1:8000` references in `src/services/api.js`, `src/pages/Login.jsx`, and `src/pages/Register.jsx` to `import.meta.env.VITE_API_URL`.
  - Frontend repo git repository setup (currently a standalone sibling directory).

## 4. TOOLING GOTCHAS
- **Common `CHANGELOG.md`:** Keep only a single common `CHANGELOG.md` synchronized across both repos (`actfta` and `actfta-api`), newest entries first.
- **Cross-Repo Docs Focus:** `AGENTS.MD` and `README.md` are repo-specific and kept in sync only in the sense that they contain key integration info about the sibling repo; deep internal implementation details belong in the respective repo's docs.
- **Keep API contracts synchronized:** Whenever routes or Pydantic schemas change in `actfta-api`, re-export `http://127.0.0.1:8000/openapi.json` to `openapi.json` and update `src/models/` + `src/services/` in lockstep.
- **Frontend Tooling:** Use Node.js `>= 20` and `npm`. Run `npm run dev` for dev server, `npm run build` for production bundle verification, `npm run lint` for ESLint, and `npx playwright test` for E2E tests.
- **Login API Contract:** `POST /auth/login` expects JSON `{"email": "...", "password": "..."}` and returns `{"token": "...", "user_id": "...", "email": "..."}`.
- **Multi-Repo Sandboxes:** When running AI agents across both repositories, ensure access to both `/Users/am/projects/vegan/actfta` and `/Users/am/projects/vegan/actfta-api`.

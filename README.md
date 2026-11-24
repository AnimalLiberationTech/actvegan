# ActVegan Frontend (`actfta`)

React 19 single-page application for **ActVegan (`actFTA`)**, a multi-user, multi-role activist action and task coordination platform built for the Vegetarian Union of Moldova (`AnimalLiberationTech`).

> **Documentation & Guidelines:**
> - Common change history (shared with backend): [CHANGELOG.md](CHANGELOG.md)
> - Frontend Agent/AI operational guidelines: [AGENTS.MD](AGENTS.MD)
> - Sibling Backend API repository & docs: [`../actfta-api/README.md`](../actfta-api/README.md) and [`../actfta-api/AGENTS.MD`](../actfta-api/AGENTS.MD)

---

## 1. Architecture & Repository Overview

| Component | Repository / Path | Stack | Default Local Endpoint |
|---|---|---|---|
| **Frontend SPA** (this repo) | `~/projects/vegan/actfta` | React 19, Vite 8, Tailwind CSS v4, React Router v7, Axios, Motion, Hugeicons | `http://localhost:5173` / `https://act.vegan.md` |
| **Backend API** (sibling) | `~/projects/vegan/actfta-api` | Python 3.14, `uv`, FastAPI, SQLModel (SQLite / Appwrite `TablesDB`), JWT + bcrypt | `http://127.0.0.1:8000` (`/docs`) / `https://api.act.vegan.md` |

### Key Backend Integration Points
- **API Base:** `http://127.0.0.1:8000` in dev, `https://api.act.vegan.md` in production (configurable via `VITE_API_URL`).
- **Authentication:** HS256 JWT tokens via `Authorization: Bearer <token>`.
- **Contract Schema:** Local snapshot stored at [`openapi.json`](openapi.json), exported from backend `GET /openapi.json`.
- **Backend Setup Reference:** For full backend setup, database adapters, Appwrite serverless functions, and Trello sync, refer to [`actfta-api/README.md`](../actfta-api/README.md).

---

## 2. Quick Start

### Prerequisites
- Node.js `>= 20`
- `npm`
- Running instance of backend `actfta-api` (see below)

### 1. Ensure backend is running
In sibling directory `~/projects/vegan/actfta-api`:
```bash
cd ~/projects/vegan/actfta-api
uv sync --all-groups
uv run uvicorn src.api.app:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI is accessible at `http://127.0.0.1:8000/docs`.

### 2. Install dependencies & start frontend
In this directory (`~/projects/vegan/actfta`):
```bash
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

> [!NOTE]
> In dev mode, Vite's custom `loginApiLogger` plugin (`vite.config.js`) mirrors login API attempts (`[Login API 200]`, `[Login API 401]`, etc.) directly into your dev terminal.

### 3. Sync OpenAPI contract snapshot
Whenever backend endpoints or Pydantic schemas change in `actfta-api`:
```bash
curl -s http://127.0.0.1:8000/openapi.json -o openapi.json
```
Then update models in `src/models/` and services in `src/services/` to match.

---

## 3. Directory Map

```text
actfta/
├── src/
│   ├── models/                # Domain normalizers & payload builders (Task.js, User.js)
│   ├── services/              # Axios transport (api.js) + taskService.js & userService.js
│   ├── hooks/                 # React state & optimistic operations (useTasks.js)
│   ├── pages/                 # Home, Stats, Donate, Login, Register, AdminDashboard
│   ├── components/            # TaskForm, TaskList, TaskItem, SlideCommit, Noise, PublicNav, BrandLogo
│   ├── assets/fonts/          # Neucha typography font
│   ├── App.jsx                # Auth-gated router & userReady initialization
│   ├── main.jsx               # React DOM root entrypoint
│   └── index.css              # Tailwind CSS v4 + light/dark CSS tokens (:root / :root.dark)
├── tests/                     # Playwright E2E test specs
├── openapi.json               # Synced OpenAPI contract snapshot from actfta-api
├── package.json               # Scripts & dependencies
├── playwright.config.ts       # Playwright E2E configuration
├── eslint.config.js           # ESLint 9 configuration
└── vite.config.js             # Vite configuration + loginApiLogger plugin
```

---

## 4. Frontend Routes & Roles

| Path | Access | Description |
|---|---|---|
| `/` | Public (redirects to role home when logged in) | `Home.jsx` — Landing page with `<Noise />` canvas & `<SlideCommit />` slider CTA |
| `/stats` | Public (always) | `Stats.jsx` — Platform impact and statistics |
| `/donate` | Public (always) | `Donate.jsx` — Supporter and contribution information |
| `/login` | Public (unauthenticated) | `Login.jsx` — Email & password authentication |
| `/register` | Public (unauthenticated) | `Register.jsx` — Registration (defaults to `disabled` status pending admin approval) |
| `/dashboard` | Authenticated (`user`) | Personal and activist task creation (`TaskForm`) and task list |
| `/admin` | Authenticated (`admin`, `super_admin`) | `AdminDashboard.jsx` — Advanced task controls + user approval and enable/disable management |

---

## 5. Styling & Theme System

- **Tailwind CSS v4:** Configured via `@tailwindcss/vite` in `vite.config.js` and `@import "tailwindcss";` in `src/index.css`.
- **Dark Mode:** Driven by class-free CSS variables on `:root` and `:root.dark`, persisted in `localStorage.theme`.
- **Typography:** Local font `Neucha` loaded via `@font-face` in `src/index.css` for headlines and branding.

---

## 6. Testing & Quality Checks

```bash
# Run ESLint 9 checks
npm run lint

# Verify production Vite build
npm run build

# Run Playwright E2E tests
npx playwright test
```


---

## 7. Telegram Mini App

The frontend is a fully functional **Telegram Mini App** (Web App) integrated with the `SproutScoutBot` bot. When opened inside Telegram, users are authenticated automatically via signed `initData` — no email or password needed.

### How Telegram Auth Works

1. User opens the Mini App inside Telegram.
2. Telegram injects `window.Telegram.WebApp` with `initData` — a URL-encoded, HMAC-SHA256-signed string containing the user's Telegram ID, name, username, and a cryptographic hash.
3. The `useTelegramApp` hook reads this data and signals the app is ready (`tg.ready()` + `tg.expand()`). It also syncs Telegram's native `themeParams` to the app's CSS variables.
4. `TelegramLogin` component sends the parsed `initData` payload to `POST /auth/telegram` on the FastAPI backend.
5. The backend (`actfta-api`) validates the HMAC-SHA256 hash against `TELEGRAM_BOT_TOKEN` and returns a JWT.
6. The token is stored in `localStorage` and the user is redirected to their role dashboard.
7. If not inside Telegram (browser fallback), the standard email/password login flow is used.

> [!NOTE]
> New Telegram users are auto-created as `disabled` accounts. An `admin` or `super_admin` must enable them before they can access protected task features.

---

### Bot Setup (`@BotFather`)

#### 1. Get or create the bot

If creating fresh:
```
@BotFather → /newbot
Name: Act Vegan
Username: ActVeganBot
```
Save the token to `actfta/.env` **and** to `actfta-api/.env` as `TELEGRAM_BOT_TOKEN`.

#### 2. Register the Mini App (Web App)

```
@BotFather → /newapp → Select ActVeganBot
App title: ActVegan app
Short description: Activist task coordination
Photo: (upload a 640×360 image)
Web App URL: https://act.vegan.md/
```

#### 3. Set the menu button to open the Mini App

```
@BotFather → /setmenubutton → Select ActVeganBot
URL: https://act.vegan.md/
Button text: 🌱 Open App
```

#### 4. Set the bot domain (required for Telegram Login Widget)

```
@BotFather → /setdomain → Select ActVeganBot
Domain: act.vegan.md
```

---

### GitHub Pages Deployment & Setup

The frontend deploys automatically to GitHub Pages on every push to `main` using the GitHub Actions workflow in [`.github/workflows/deploy-gh-pages.yml`](.github/workflows/deploy-gh-pages.yml).

#### 1. DNS Configuration for `act.vegan.md`

In your DNS provider (e.g., Cloudflare, Namecheap, Route 53) managing `vegan.md`:

1. **Delete** any existing `A` or `AAAA` records for `act` (or `act.vegan.md`).
2. **Add a `CNAME` record**:
   - **Type:** `CNAME`
   - **Name / Host:** `act` (or `act.vegan.md`)
   - **Target / Value:** `animalliberationtech.github.io`
   - **Proxy status:** If using Cloudflare, set to **DNS only** (gray cloud) so GitHub can verify the domain and issue the Let's Encrypt SSL certificate.

> [!WARNING]
> GitHub Pages rejects subdomains (`act.vegan.md`) configured with `A` records (`InvalidARecordError`). Subdomains must point to `animalliberationtech.github.io` via `CNAME`.

#### 2. Configure GitHub Pages in Repository Settings

1. In your GitHub repository, navigate to **Settings** → **Pages** (in the left sidebar under *Code and automation*).
2. Under **Build and deployment** → **Source**, select **GitHub Actions** (do **not** select *Deploy from a branch*).
3. Under **Custom domain**, enter `act.vegan.md` and click **Save** (automatically kept in sync via [`public/CNAME`](public/CNAME)).
4. Wait for DNS check to pass, then check **Enforce HTTPS**.

#### 3. Set Up Repository Secrets

Configure the production backend URL for the build step:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Add the following secret:

| Secret | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://api.act.vegan.md` | Base URL for FastAPI backend in production |

> [!CAUTION]
> **DO NOT store `TELEGRAM_BOT_TOKEN` in `actfta`'s GitHub Actions secrets or client-side bundles.**
> The frontend SPA runs in the user's browser; only the backend (`actfta-api`) needs `TELEGRAM_BOT_TOKEN` to verify `initData` HMAC signatures. Exposing the token to the frontend would allow anyone to steal it and compromise your bot.

#### 4. Workflow Permissions

The deploy workflow explicitly configures the required token permissions:
- `contents: read`
- `pages: write`
- `id-token: write`

Under **Settings** → **Actions** → **General** → **Workflow permissions**, ensure workflows are allowed to submit deployments (default for standard repositories).

#### 5. How the Build & Routing Work

1. **Custom Domain & Base Path:** With custom domain `act.vegan.md`, the app is served from root (`base: '/'`). The domain is committed to [`public/CNAME`](public/CNAME) and preserved across builds.
2. **SPA Routing Fallback:** The workflow copies `dist/index.html` to `dist/404.html` so direct navigation or refreshing React Router sub-routes (e.g., `/dashboard`, `/admin`) correctly loads the app without 404 errors.
3. **Artifact Deployment:** The `dist/` directory is packaged with `actions/upload-pages-artifact@v3` and published via `actions/deploy-pages@v4`.

#### 6. Triggering Deployment

- **Automatic:** Push changes to the `main` branch:
  ```bash
  git push origin main
  ```
- **Manual:** Go to the **Actions** tab on GitHub → select **Deploy to GitHub Pages** in the left sidebar → click **Run workflow** → select branch `main` → click **Run workflow**.

Once deployed, the Mini App is live at:
```text
https://act.vegan.md/
```

---

### Local Testing with Telegram

> [!TIP]
> To test the real Telegram WebApp context locally, use `ngrok` to expose your local dev server over HTTPS.

```bash
# 1. Start local dev server
npm run dev   # → http://localhost:5173

# 2. In a separate terminal, create an HTTPS tunnel
ngrok http 5173
# → Forwarding: https://xxxx.ngrok-free.app → localhost:5173

# 3. In @BotFather, temporarily update the Web App URL to the ngrok URL
#    @BotFather → /editapp → SproutScoutBot → Edit Web App URL
#    URL: https://xxxx.ngrok-free.app
```

Open the bot in Telegram on your phone, tap the menu button — `window.Telegram.WebApp` will be populated with real `initData` from your Telegram account, and the full auth flow will run against your local backend.

For pure browser testing (no Telegram), the app falls back seamlessly to the standard email/password login.

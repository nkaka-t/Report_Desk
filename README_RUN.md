ReportDesk — Run locally (step-by-step)

This guide walks a developer (Windows, PowerShell) through pulling this repository and running the project locally without Docker, using the provided sqlite fallback. It also includes optional Docker instructions if you prefer to run Postgres + MailHog.

Prerequisites
- Node.js (v16+ recommended; v18+ or v20+ should work). Confirm with:

```powershell
node -v
npm -v
```

- Git
- (Optional) Docker Desktop if you want Postgres + MailHog, but the project supports a sqlite fallback.

Repository layout (important paths)
- `backend/` — Express API server (Sequelize models, migrations/seeds)
- `frontend/` — React single-page app (Create React App, TypeScript + MUI)

Quick start (sqlite, no Docker)
1. Clone the repo and switch to the branch used here (example branch: `frontend-setup`):

```powershell
cd C:\Users\<yourname>\Desktop
git clone https://github.com/nkaka-t/ReportDesk.git
cd ReportDesk
git checkout frontend-setup
```

2. Install backend dependencies and prepare SQLite mode

```powershell
cd backend
npm install
```

The backend supports two DB modes via environment variable `DB_CLIENT`. For local dev without Docker we'll use SQLite.

3. Seed the database (SQLite)

```powershell
# From the backend directory
# This script will run Sequelize seed logic using the sqlite fallback
npm run seed:sqlite
```

You should see logs like "DB OK" and seeded users (admin@example.com etc).

4. Start the backend in sqlite dev mode

```powershell
# From backend directory
npm run dev:sqlite
```

This runs nodemon with `DB_CLIENT=sqlite` and starts the server on port 4000 by default. You should see:

- "DB connected"
- "DB synchronized"
- "Server listening on port 4000"

Verify the API root in another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:4000/
```

You should get a JSON response like { "status": "ok", "name": "ReportDesk API" }.

5. Install and start frontend

Open a new PowerShell window and run:

```powershell
cd C:\Users\<yourname>\Desktop\ReportDesk\frontend
npm install
npm run dev
```

- The dev server will start (Create React App). If port 3000 is in use, the dev server will prompt to use a different port (say 3001) — press `Y` or allow it to auto-select.
- When the browser opens, the app will attempt to call the API at `http://localhost:4000/api` (proxy configured in frontend). Ensure the backend is running.

Notes about authentication and UI
- The app stores the JWT in `localStorage.token` after login. Use the seeded users from `seed:sqlite` to log in (for example `admin@example.com`).
- Logout clears the token and triggers an `authchange` event the UI listens to.

Optional: Running with Docker (Postgres + MailHog)
- This repository includes `docker-compose.yml` to run Postgres and MailHog. If you prefer Docker and your Docker Desktop works, use the following from the repo root:

```powershell
cd C:\Users\<yourname>\Desktop\ReportDesk
docker compose up -d
```

- Wait for Postgres to become healthy. If you run into Docker Desktop startup problems, use the sqlite instructions above instead.

Troubleshooting
- "Port 3000 already in use" — either allow CRA to use another port or kill the process using port 3000.
  - Find the process using port 3000 (PowerShell):

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

  - Kill the process (if appropriate):

```powershell
Stop-Process -Id <pid> -Force
```

- "Docker Desktop unable to start" — run without Docker using the sqlite path above.
- Frontend TypeScript/JSX parse errors (e.g. in `frontend/src/App.tsx`) — open that file and look for stray characters (like Markdown fences) and ensure the file compiles. The project includes `frontend/src/App.tsx` where the top-level routes and AppBar live.

Files you may edit while running locally
- `backend/.env` (create from `.env.example`) — set `DB_CLIENT=sqlite` or `postgres` and DB credentials
- `backend/src/config/database.js` — DB configuration logic
- `frontend/src/App.tsx` — top-level app, routes, AppBar and navigation
- `frontend/src/pages` — UI pages (Login, Signup, Reports, SubmitReport, etc.)

Commands summary (copyable)

```powershell
# clone
git clone https://github.com/nkaka-t/ReportDesk.git
cd ReportDesk
git checkout frontend-setup

# backend (sqlite)
cd backend
npm install
npm run seed:sqlite
npm run dev:sqlite

# frontend
cd ../frontend
npm install
npm run dev
```

If you want, I can also add a small troubleshooting section to the repository README (`README.md`) or create a `README_RUN.md` here in the repo root (I already created this file). Tell me if you'd like extra details such as Postgres connection examples, environment variable templates, or how to run tests.
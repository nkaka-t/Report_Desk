ReportDesk — Guide

This repository contains a Node.js + Express backend and a Vite + React frontend for a simple report management application (ReportDesk).

This guide explains how to clone the repository, install dependencies, configure environment variables, and run both backend and frontend locally using sqlite for local development.

Prerequisites
- Node.js (v14+ recommended)
- npm (comes with Node.js)
- Git

Clone the repository
1. Clone this repository:

   git clone https://github.com/nkaka-t/Report_Desk.git
   cd Report_Desk

Repository layout
ReportDesk — Detailed Setup & Run Guide

This guide will walk you through cloning this repository, preparing your environment, installing dependencies, running the backend (Express + Sequelize) and the frontend (Vite + React), seeding the database, and troubleshooting common problems. Commands are written for Windows PowerShell. Adjust for Bash/macOS as needed.

Contents
- Prerequisites
- Clone & prepare repository
- Make the repo self-contained (handle nested frontend .git)
- Backend: install, env, seed, run
- Frontend: install, env, run
- End-to-end testing (submit → review → approve)
- Building for production
- Git workflow & pushing changes
- Troubleshooting

Prerequisites
- Node.js v14+ (Node 16 or 18 recommended)
- npm (bundled with Node)
- Git (2.20+ recommended)
- Optional: sqlite3 CLI for inspecting local sqlite DB

1) Clone the repository

Open PowerShell and run:

```powershell
cd $HOME\Desktop
git clone https://github.com/nkaka-t/Report_Desk.git Report_Desk
cd Report_Desk
```

If the repo was empty when cloned then you may already have copied the project into this folder (as done in a previous step). If you are cloning a fresh copy, continue below.

2) Make repo self-contained (IMPORTANT)

If the `frontend` directory is itself a git repository (it has a `.git` folder), then the top-level repo currently contains an *embedded git repository* (a gitlink). That can cause confusion and makes cloning the top-level repo not include the frontend files.

Recommended: remove the nested `.git` inside `frontend` so the frontend becomes part of the main repository. From the repo root run:

```powershell
# Verify nested .git exists
Test-Path frontend\.git

# Remove nested .git (this will not delete frontend files)
Remove-Item -Recurse -Force frontend\.git

# Stage and commit the change
git add frontend
git commit -m "Include frontend files in top-level repository (remove nested .git)"
git push
```

If you intentionally want `frontend` as a submodule, instead add it as a submodule. Otherwise do the removal step above to keep the repo self-contained.

3) Backend setup (local development using sqlite)

From the repository root:

```powershell
cd backend
npm install
```

Create an environment file. Copy `.env.example` if present, or create `.env` with the following values (for local dev):

```
PORT=4000
DB_CLIENT=sqlite
DATABASE_URL=sqlite:./dev.sqlite
JWT_SECRET=dev-secret-change-me
NODE_ENV=development
```

Notes:
- `DB_CLIENT=sqlite` causes the app to use sqlite for local dev.
- `DATABASE_URL=sqlite:./dev.sqlite` stores the db file at `backend/dev.sqlite`.
- Keep JWT_SECRET secret in production — use environment variables.

Run database seed (if provided) and start the backend:

```powershell
# optional: run seed if present
node src/seeds/seed.js

# start backend in sqlite dev mode (this repo uses a convenience script)
npm run dev:sqlite
```

What the startup does
- On dev startup the server runs some safe sqlite ALTER logic to add missing columns (non-destructive) so older local DBs get updated. Restart the server after changing models.

4) Frontend setup and run

From repo root or a new terminal:

```powershell
cd frontend
npm install
```

Configure the frontend to call the backend API. By default the frontend expects an API at `http://localhost:4000/api`. If you need to override, create `.env` in `frontend/` and set a value the app reads (check `frontend/src/lib/api.ts` for the axios base URL). Then run:

```powershell
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`). Open that in a browser.

5) Seeding & test accounts

- The backend may include a seed script at `backend/src/seeds/seed.js` that creates default users (admin/reviewer/approver/employee). Run it with `node src/seeds/seed.js` from `backend/`.
- Seeded credentials (if present) are often:
  - admin@example.com / AdminPass123!
  - reviewer@example.com / Reviewer123!
  - approver@example.com / Approver123!
  - employee@example.com / Employee123!

6) Quick end-to-end test

1. Start backend (`npm run dev:sqlite`).
2. Start frontend (`npm run dev`).
3. Log in as an admin or seeded user.
4. Go to Departments page: add, edit, delete departments and confirm they persist.
5. Go to Reports: submit a new report (attach a small file), then log in as reviewer to review it, then approver to approve it. Check the Notifications page for updates.

7) Build for production

Backend: ensure `NODE_ENV=production` and use a production-grade DB (Postgres). Use `npm start` or your process manager (PM2/systemd).

Frontend: from `frontend/` run:

```powershell
npm run build
```

Then copy `frontend/dist` into your production webserver, or serve it from the backend by placing the build at the expected static path. The backend `src/index.js` will serve `frontend/dist` when present.

8) Git workflow & pushing your changes

Create feature branches and push to the repo. Example using PowerShell:

```powershell
# create feature branch from dev
git checkout dev
git pull
git checkout -b feature/my-change
# work, stage, commit
git add .
git commit -m "Implement feature X"
# push the branch
git push -u origin feature/my-change
```

If you need to push to the repo but have authentication issues, use one of:
- Configure SSH keys and push using the SSH remote URL
- Create a GitHub Personal Access Token and use it as the password when prompted (HTTPS push)

9) Removing nested `.git` (if you skipped earlier)

If you find `frontend/.git` still exists, run:

```powershell
Remove-Item -Recurse -Force frontend\.git
git add frontend
git commit -m "Include frontend in top-level repo (remove nested .git)"
git push
```

10) Troubleshooting

- Backend fails to start: check `backend/.env`, ensure `DATABASE_URL` is valid, and look at the console log. For sqlite, ensure the process can write to `backend/dev.sqlite`.
- DB schema mismatch: restart the backend (dev) so the sqlite-safe ALTER runs. If problems persist, delete `backend/dev.sqlite` (dev-only) and re-seed.
- Frontend CORS errors: ensure backend `cors()` is enabled (it is by default) and the frontend base URL points to `http://localhost:4000`.
- File uploads failing: client must POST as multipart/form-data (use FormData). Do not set Content-Type manually — let the browser set it.

11) Useful commands (PowerShell)

```powershell
# from repo root
# backend
cd backend; npm install; npm run dev:sqlite
# frontend
cd frontend; npm install; npm run dev
# seed (if exists)
cd backend; node src/seeds/seed.js
# remove nested git
Remove-Item -Recurse -Force frontend\.git
# add and push
git add .; git commit -m "Your message"; git push origin dev
```

12) Where to find code

- Backend routes: `backend/src/routes`
- Backend models: `backend/src/models`
- Frontend pages: `frontend/src/pages`
- Frontend api wrapper: `frontend/src/lib/api.ts`

If you want, I can:
- Remove the nested `frontend/.git` now and commit/push the change so this repo is self-contained.
- Start the backend and frontend here and run an end-to-end test (create department, submit report, review, approve) and share logs/screenshots.

Guide last updated: 2025-10-23

# ReportDesk - Company Internal Reporting System

This repository contains a reporting management system (frontend + backend) for internal company use.

High level:
- Backend: Node.js + Express
- Frontend: React.js (created with Create React App)
- Database: PostgreSQL (docker-compose)

Quick start (development):
1. Install Docker and Docker Compose.
2. Copy `.env.example` to `.env` and set values.
3. Run `docker compose up -d` to start PostgreSQL.
4. In `backend/` run `npm install` then `npm run dev`.
5. In `frontend/` run `npm install` then `npm start`.

See `backend/README.md` and `frontend/README.md` for more details.

Running seeds (backend):

1. Ensure PostgreSQL is running (via `docker compose up -d`).
2. From the project root, install backend deps and run the seed script:

```powershell
cd backend
npm install
npm run seed
```

This will create default departments, a report type, and initial users (admin/reviewer/approver/employee).

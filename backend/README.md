ReportDesk Backend

Setup

1. Copy `.env.example` from project root into backend folder or ensure environment variables are set.
2. Run `npm install`.
3. Start server: `npm run dev`.

Notes
- Uses Sequelize for DB access (configured later).
- Add migrations and models in `src/models`.

Running with Docker Postgres

1. From project root run:

```powershell
docker compose up -d
```

2. Install backend dependencies and start the server:

```powershell
cd backend
npm install
npm run dev
```

Seeding the database

After the DB is up and the backend dependencies are installed you can run the seed script:

```powershell
cd backend
npm run seed
```

This will insert basic departments, a report type, and default users for testing.

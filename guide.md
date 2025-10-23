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
- backend/ — Express + Sequelize API
- frontend/ — Vite + React TypeScript UI

Backend setup (sqlite - local dev)
1. Enter the backend folder and install dependencies:

   cd backend
   npm install

2. Create a `.env` file in `backend/` (you can copy `.env.example` if present) and set:

   PORT=4000
   DB_CLIENT=sqlite
   DATABASE_URL=sqlite:./dev.sqlite
   JWT_SECRET=your-secret-for-dev
   NODE_ENV=development

3. Run the backend in sqlite dev mode:

   npm run dev:sqlite

   This startup script includes safe sqlite ALTER logic to add missing columns for local development. If you change models, restart the backend so those adjustments are applied.

Frontend setup
1. From the repository root:

   cd frontend
   npm install

2. Create a `.env` file if needed or ensure the frontend is pointing to `http://localhost:4000/api` (the default dev backend address).

3. Run the frontend dev server:

   npm run dev

Running the app
- Start the backend first, then the frontend.
- Visit the frontend dev URL (printed by Vite, typically `http://localhost:5173`).

Seeding & accounts
- The repository may include seeded users for dev (admin, reviewer, approver, employee). Check `backend/seeders` or `backend/src/utils` for hints. Default seeded credentials (if present) are typically printed on backend startup or documented.

Working with the code
- Backend models are in `backend/src/models`.
- Routes are in `backend/src/routes`.
- The frontend pages are in `frontend/src/pages`.

Tests & linting
- There are no automated tests in this repo by default. You can add tests using your preferred framework.

How to push your local changes back to GitHub
1. Create a main branch locally and push to the remote (example):

   git checkout -b main
   git add .
   git commit -m "Initial push from local workspace"
   git remote add origin https://github.com/nkaka-t/Report_Desk.git
   git push -u origin main

If push fails due to authentication, generate a personal access token (PAT) and use it in place of your password, or configure SSH keys and use the SSH remote URL.

Support
- If you hit issues during setup, copy the terminal output and open an issue in the repo or contact the maintainer.


Guide created on: 2025-10-23

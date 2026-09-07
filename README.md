# Venue Vendors

A full-stack venue booking platform. Hirers browse venues and request bookings for
event timeslots; vendors manage their own venues, timeslot availability, and
incoming booking requests.

Built for RMIT's Full Stack Development course, Semester 1 2026, as a two-person
team project. I owned authentication and the entire hirer-side feature set; my
teammate owned vendor-side features and the data visualisation charts.

## Tech stack

React (TypeScript) + Next.js frontend, Node/Express + TypeORM backend, MS SQL
Server database, REST API.

## What I built

- Rebuilt an earlier localStorage-only prototype into a full-stack app with a
  persistent REST API and cloud-hosted SQL Server database
- Designed the relational schema (ER diagram, in `/docs`) and built server-side
  authentication with hashed passwords and role-based route protection
- Built a keyword-based venue recommendation engine that scores venues against
  event categories like weddings and concerts
- Set up a file-ownership convention across the team that eliminated backend
  merge conflicts

## Folders

- `frontend` — the React/Next.js app (hirer and vendor views)
- `backend` — the Express + TypeORM REST API
- `docs` — ER diagram and user stories
- `admin-frontend`, `admin-backend` — scaffolding for an admin dashboard that
  was scoped out of the final submission, not a working feature

## Running it locally

Needs Node.js v18+. This was built against a university-hosted SQL Server
instance that's no longer available, so to run it yourself you'll need your own
SQL Server (or Azure SQL) instance and to fill in `backend/.env` from
`.env.example`.

cd backend
cp .env.example .env # fill in your own DB credentials + a JWT secret
npm install
npm run dev # API runs on http://localhost:3001
npm run seed # optional: loads demo users and venues


Demo logins after seeding (password: `Passw0rd!`):
`admin@vv.com` · `vendor@vv.com` · `hirer@vv.com`

cd frontend
npm install
npm run dev # http://localhost:3000

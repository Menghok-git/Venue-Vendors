# Venue Vendors

Full Stack Development (COSC2758) Assignment 2 — team **jeffry-team-11** (pra01-01, Thu 6:30pm).

Repo: https://github.com/rmit-fsd-2026-s1/a2-fsd-pra01-01-thu-6-30pm-jeffry-team-11

A venue-hire web app. The React (Next.js) frontend talks to a Node/Express + TypeORM
backend over a REST API, with data stored in a cloud MS SQL Server database. There is
also a separate admin app (`admin-frontend` / `admin-backend`) that uses GraphQL.

## Folders

- `frontend` — the React/Next.js app (hirer and vendor)
- `backend` — the Express + TypeORM REST API
- `admin-frontend`, `admin-backend` — the admin app (GraphQL)
- `docs` — ERD and user stories

## Running it locally

You need Node.js (v18+) installed and access to the team's MS SQL Server database.

**Backend** (first terminal):

```
cd backend
cp .env.example .env      # then fill in the real DB password + a JWT secret (see below)
npm install
npm run dev               # API runs on http://localhost:3001
npm run seed              # optional: loads demo users + venues
```

**Frontend** (second terminal):

```
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # app runs on http://localhost:3000
```

Demo accounts created by `npm run seed` (password `Passw0rd!`):
`hirer@vv.com`, `vendor@vv.com`, `admin@vv.com`.

## Environment variables

Secrets are **not** committed. Each app ships an example file you copy and fill in:
`backend/.env.example` → `backend/.env`, and `frontend/.env.local.example` → `frontend/.env.local`.
The real database credentials for the shared team database have been provided to the
teaching team separately (see the submission note / Canvas), so they can run the app.

**Backend (`backend/.env`):**

| Variable | Purpose | Example / default |
| --- | --- | --- |
| `DB_HOST` | MS SQL Server host (course RDS) | `your-db-host.rds.amazonaws.com` |
| `DB_PORT` | DB port | `1433` |
| `DB_USERNAME` | DB user | `your_db_username` |
| `DB_PASSWORD` | DB password | *(secret — supplied separately)* |
| `DB_NAME` | Shared team database | `s3988312` |
| `DB_ENCRYPT` | Encrypt the connection | `false` |
| `DB_TRUST_SERVER_CERT` | Trust self-signed cert | `true` |
| `DB_SYNCHRONIZE` | Auto-create tables from entities | `true` (dev) |
| `JWT_SECRET` | Signs auth tokens | *(secret — long random string)* |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `PORT` | API port | `3001` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

**Frontend (`frontend/.env.local`):**

| Variable | Purpose | Example / default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:3001` |

## References

Course material:

- COSC2758 Full Stack Development — course lab material (Weeks 6-11). We mainly followed the
  React/Next.js and TypeScript lab examples for the frontend (component structure, hooks, forms,
  and the page/routing setup), and the Express + TypeORM and JWT auth examples for the backend.

Library / framework documentation:

- Next.js — https://nextjs.org/docs
- React — https://react.dev
- Express — https://expressjs.com
- TypeORM — https://typeorm.io
- node-mssql driver — https://github.com/tediousjs/node-mssql
- express-validator — https://express-validator.github.io
- bcryptjs — https://github.com/dcodeIO/bcrypt.js
- jsonwebtoken — https://github.com/auth0/node-jsonwebtoken
- Axios — https://axios-http.com/docs/intro
- Recharts — https://recharts.org
- Tailwind CSS — https://tailwindcss.com/docs

## Use of Generative AI

In general terms, we used it to help draft and structure the ERD and user stories in docs/, to suggest boilerplate and structure for some of the backend controllers and the validation, and some of the frontend components (which we then adapted to fit our own entities and existing patterns), and to help draft and format this README. The database design, the core logic, and the final code were written and verified by us.

Where we used it:

- docs/ ERD and user stories — helped us draft and lay out the entity-relationship diagram (entities, columns, crow's-foot relationships) and turn our feature list into proper user stories with Given/When/Then acceptance criteria.
- Backend controllers / validation scaffolding — suggested boilerplate and structure for the booking and hirer controllers
(BookingController.ts, HirerController.ts), the route validation, and several
hirer frontend components (VenueList.tsx, HireApplication.tsx, MyBookings.tsx).
We adapted all of it to fit our entities and to match the existing AuthController
and VenueController patterns.
- README and documentation wording — helped us draft and format this README.
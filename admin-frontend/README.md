# admin-frontend (HD - build LAST)

Separate **React TS** app (Next.js, like `frontend/`) for administrators only.
Talks to `admin-backend` via **GraphQL** (Apollo Client or urql) - NOT axios/REST.

Scope:
- Admin-only login screen (`admin` / `admin`).
- Assign vendors to venues; manage (CRUD) venues; feature venues.
- View + download the PDF reports (top-3 venues, top-3 applicants).

Run on a different port (e.g. 3002). Keep completely separate from the main VV app.

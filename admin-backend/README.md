# admin-backend (HD - build LAST)

Separate **Node + Express + TypeORM** service exposing a **GraphQL** API for the
admin app. Connects to the SAME team database as `backend/`.

> Rubric trap: the admin API MUST be GraphQL. Using REST here = ZERO for the HD admin part.

Scope:
- Admin login (`admin` / `admin`).
- Assign a vendor to a venue; CRUD venues; feature/unfeature venues.
- Reports: top-3 venues (by bookings) and top-3 applicants - downloadable as **PDF**.
- Pick ONE: (a) 6+ backend unit tests, OR (b) a GraphQL subscription real-time feature.

Suggested stack: `@apollo/server` + `graphql` (+ `graphql-ws` if you do subscriptions),
reusing the entities from `../backend/src/entity` (import or copy).
Run on a different port (e.g. 4001). Do not start this until PA/CR/DI are solid.

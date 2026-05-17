# Stryde Admin

Separate administration console for the Stryde platform. Connects to the existing FastAPI backend without backend code changes.

## Security

- **Email allowlist**: Only emails in `ADMIN_ALLOWED_EMAILS` can sign in.
- **HttpOnly cookies**: Access tokens are not stored in `localStorage`.
- **Server-side proxy**: Mutations go through `/api/admin/*` routes that re-verify the admin session.
- **No search indexing**: `robots: noindex` on all pages.

## Setup

```bash
cd stryde-admin
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Environment

| Variable | Description |
|----------|-------------|
| `API_BASE_URL` | FastAPI backend URL (default `http://127.0.0.1:8000`) |
| `ADMIN_ALLOWED_EMAILS` | Comma-separated admin emails (required in production) |

Use an existing Stryde user account whose email is on the allowlist.

## Features

- **Overview** — users, clubs, posts, plans counts; API health
- **Users** — browse runners, view profiles, **delete users**
- **Community** — edit global community, post chat announcements
- **Announcements** — broadcast in-app notifications to all users
- **Clubs** — list clubs, members, **delete any club** (except community)
- **Content** — feed moderation, **delete any post**
- **Training plans** — create templates, add workouts
- **Races** — search RunSignup, import to database
- **System** — health and configuration summary

## Backend requirement

Platform admin APIs live at `/api/v1/admin/*` on the FastAPI backend. Set the **same** `ADMIN_ALLOWED_EMAILS` in:

- `stryde-admin/.env.local`
- `website-stryde-backend/.env`

Run migration for announcement notifications:

```bash
cd website-stryde-backend
alembic upgrade head
```
# stryde-admin

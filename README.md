# Smart Leads Dashboard

## Project Overview

Smart Leads Dashboard is a full-stack monorepo for managing and visualizing sales leads. The **client** is a React SPA; the **server** is a Node.js API backed by MongoDB.

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Client   | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Server   | Node.js, Express, TypeScript, Mongoose, JWT, bcrypt |
| Database | MongoDB |

## Setup Instructions

1. **Clone the repository** and open the project root (`smart-leads-dashboard`).

2. **Server environment** — copy `.env.example` from the project root to `server/.env` and set:

   - `PORT` — API port (e.g. `5000`)
   - `MONGO_URI` — MongoDB connection string
   - `JWT_SECRET` — secret for signing JWTs

3. **Client environment** (optional) — copy `client/.env.example` to `client/.env` if the API is not on `http://localhost:5000`.

4. **Install dependencies** (from the project root):

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

5. **Run MongoDB** locally or use a hosted connection string in `MONGO_URI`.

6. **Start the server** (development):

   ```bash
   cd server
   npm run dev
   ```

7. **Start the client** (in a separate terminal):

   ```bash
   cd client
   npm run dev
   ```

## Features

- User authentication (register / login) with JWT
- Lead CRUD scoped to the signed-in user
- Lead filtering by status and search (name, email, company)
- Dashboard with lead counts by status
- TODO: Charts and richer analytics on the dashboard
- TODO: Role-based access (admin vs user) in the UI

## Folder Structure

```
smart-leads-dashboard/
├── client/
│   ├── src/
│   │   ├── components/     # Layout, ProtectedRoute
│   │   ├── context/        # AuthProvider
│   │   ├── lib/            # Axios API client
│   │   ├── pages/          # Login, Register, Dashboard, Leads
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/
│   │   ├── middleware/     # JWT auth
│   │   ├── models/         # User, Lead
│   │   ├── routes/
│   │   └── index.ts
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/leads` | Yes | List leads (`?status`, `?search`) |
| GET | `/api/leads/stats` | Yes | Dashboard counts |
| POST | `/api/leads` | Yes | Create lead |
| PUT | `/api/leads/:id` | Yes | Update lead |
| DELETE | `/api/leads/:id` | Yes | Delete lead |

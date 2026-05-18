# Smart Leads Dashboard

Smart Leads Dashboard is a full-stack lead management app with a React dashboard, Express API, MongoDB persistence, JWT authentication, role-based access control, CSV export, Docker support, and dark mode.

## Features

- JWT authentication with register, login, logout, and current-user session loading
- Role-based access control for `admin` and `sales`
- Protected dashboard route
- Lead CRUD with create, edit, list, view, and delete API support
- Lead filters by status, source, search text, and sort order
- Debounced search input
- Pagination with previous and next controls
- Admin-only CSV export
- Admin-only delete action in the UI and API
- Create/edit lead modal with field-level validation
- Dark mode toggle with localStorage persistence
- Dockerfiles for client and server
- Docker Compose stack with MongoDB, API, and Nginx-served client

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Client | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Server | Node.js, Express, TypeScript, Mongoose, JWT, bcrypt |
| Database | MongoDB |
| Deployment | Docker, Docker Compose, Nginx |

## Environment Variables

Root `.env.example` is used by Docker Compose.

| Name | Description | Example value |
| --- | --- | --- |
| `PORT` | API port used by the server container | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/smart-leads-dashboard` |
| `JWT_SECRET` | Secret used to sign JWTs | `change-me-in-production` |
| `VITE_API_URL` | API base URL compiled into the Vite client | `http://localhost:5000` |

For local non-Docker development, use:

| File | Variables |
| --- | --- |
| `server/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET` |
| `client/.env` | `VITE_API_URL` |

## Local Development

1. Install dependencies:

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. Create server environment file:

   ```bash
   cp server/.env.example server/.env
   ```

3. Create client environment file:

   ```bash
   cp client/.env.example client/.env
   ```

4. Start MongoDB locally or set `MONGO_URI` to a hosted MongoDB database.

5. Start the API:

   ```bash
   cd server
   npm run dev
   ```

6. Start the client in another terminal:

   ```bash
   cd client
   npm run dev
   ```

## Docker Setup

1. Create a root `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

2. Start all services:

   ```bash
   docker compose up --build
   ```

3. Open the client at the URL configured by the `client` service port mapping. By default, the compose file maps the Nginx client container to host port `3000`.

4. Stop services:

   ```bash
   docker compose down
   ```

5. Stop services and remove MongoDB data:

   ```bash
   docker compose down -v
   ```

## API Endpoints

| Method | Path | Auth required | Role | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | No | Public | Health check |
| `POST` | `/api/auth/register` | No | Public | Create account |
| `POST` | `/api/auth/login` | No | Public | Sign in |
| `GET` | `/api/auth/me` | Yes | `admin`, `sales` | Get current user |
| `GET` | `/api/leads` | Yes | `admin`, `sales` | List leads with `page`, `limit`, `status`, `source`, `search`, `sort` |
| `POST` | `/api/leads` | Yes | `admin`, `sales` | Create lead |
| `GET` | `/api/leads/export` | Yes | `admin` | Export filtered leads as CSV |
| `GET` | `/api/leads/:id` | Yes | `admin`, `sales` | Get lead by id |
| `PUT` | `/api/leads/:id` | Yes | `admin`, `sales` | Update lead; sales users may update their own leads |
| `DELETE` | `/api/leads/:id` | Yes | `admin` | Delete lead |

## Folder Structure

```text
smart-leads-dashboard/
|-- client/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   |-- tailwind.config.js
|   |-- vite.config.ts
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |   |-- axios.ts
|   |   |   |-- index.ts
|   |   |   `-- leads.ts
|   |   |-- components/
|   |   |   |-- FilterBar.tsx
|   |   |   |-- Layout.tsx
|   |   |   |-- LeadModal.tsx
|   |   |   |-- LeadsTable.tsx
|   |   |   |-- Pagination.tsx
|   |   |   |-- ProtectedRoute.tsx
|   |   |   `-- ThemeToggle.tsx
|   |   |-- context/
|   |   |   |-- AuthContext.tsx
|   |   |   `-- ThemeContext.tsx
|   |   |-- hooks/
|   |   |   |-- index.ts
|   |   |   `-- useLeads.ts
|   |   |-- pages/
|   |   |   |-- Dashboard.tsx
|   |   |   |-- Leads.tsx
|   |   |   |-- Login.tsx
|   |   |   |-- Register.tsx
|   |   |   `-- Unauthorized.tsx
|   |   |-- types/
|   |   |-- utils/
|   |   |-- App.tsx
|   |   |-- index.css
|   |   `-- main.tsx
|   `-- .env.example
|-- server/
|   |-- Dockerfile
|   |-- package.json
|   |-- tsconfig.json
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- types/
|   |   |-- utils/
|   |   `-- index.ts
|   `-- .env.example
|-- docker-compose.yml
|-- .env.example
|-- .gitignore
`-- README.md
```

## Verification

Run these checks before committing:

```bash
cd client
npm run build
cd ../server
npm run build
```

## Git Commands

```bash
git add .
git commit -m "feat: complete smart leads dashboard with auth, leads CRUD, filters, RBAC, CSV export, docker, dark mode"
```

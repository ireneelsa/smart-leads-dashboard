# API Documentation

Base URL is provided by the deployed backend URL or local server URL.

Authenticated endpoints require:

```http
Authorization: Bearer <jwt>
```

## Common Types

```ts
type UserRole = "admin" | "sales";
type LeadStatus = "new" | "contacted" | "qualified" | "lost";
type LeadSource = "website" | "instagram" | "referral";

interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  createdBy: string | {
    _id: string;
    name: string;
    email: string;
  };
}

interface ErrorResponse {
  message: string;
}
```

## Endpoint Reference

| Method + path | Description | Auth required | Required role | Request body or query params | Success response shape | Error responses |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /health` | Health check for the API process. | No | Public | None | `200` `{ status: "ok", timestamp: string }` | None expected for normal operation |
| `POST /api/auth/register` | Create a user account and return a JWT. | No | Public | Body: `{ name: string, email: string, password: string, role: "admin" \| "sales" }` | `201` `{ token: string }` | `400` missing/invalid fields, `400` password shorter than 6 chars, `409` email already registered, `500` registration failed |
| `POST /api/auth/login` | Authenticate an existing user and return a JWT. | No | Public | Body: `{ email: string, password: string }` | `200` `{ token: string }` | `400` missing email/password, `401` invalid email or password, `500` login failed |
| `GET /api/leads` | Return paginated leads with optional filters and sorting. | Yes | Both | Query: `page?: number`, `limit?: number` max 100, `status?: LeadStatus`, `source?: LeadSource`, `search?: string`, `sort?: "latest" \| "oldest"` | `200` `{ leads: Lead[], totalCount: number, totalPages: number, currentPage: number }` | `400` invalid status/source/search/sort, `401` missing/invalid token, `403` insufficient role, `500` failed to fetch leads |
| `POST /api/leads` | Create a lead for the authenticated user. | Yes | Both | Body: `{ name: string, email: string, source: LeadSource, status?: LeadStatus }` | `201` `Lead` | `400` missing/invalid fields, `401` missing/invalid token, `403` insufficient role, `409` duplicate lead email, `500` failed to create lead |
| `GET /api/leads/export` | Export filtered leads as a CSV file. | Yes | Admin | Query: `status?: LeadStatus`, `source?: LeadSource`, `search?: string` | `200` CSV text with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="leads.csv"` | `400` invalid status/source/search, `401` missing/invalid token, `403` insufficient role, `500` failed to export leads |
| `GET /api/leads/:id` | Fetch one lead by MongoDB ObjectId. | Yes | Both | Path param: `id: string` | `200` `Lead` | `400` invalid lead id, `401` missing/invalid token, `403` insufficient role, `404` lead not found, `500` failed to fetch lead |
| `PUT /api/leads/:id` | Update a lead. Admins can update any lead; sales users can update leads they created. | Yes | Both | Path param: `id: string`. Body: one or more of `{ name?: string, email?: string, source?: LeadSource, status?: LeadStatus }` | `200` `Lead` | `400` invalid lead id or no valid update fields, `401` missing/invalid token, `403` sales user updating another user's lead or insufficient role, `404` lead not found, `409` duplicate lead email, `500` failed to update lead |
| `DELETE /api/leads/:id` | Delete a lead. | Yes | Admin | Path param: `id: string` | `200` `{ message: "Lead deleted successfully" }` | `400` invalid lead id, `401` missing/invalid token, `403` insufficient role, `404` lead not found, `500` failed to delete lead |

## Notes

- `GET /api/leads` defaults to `page=1`, `limit=10`, and `sort=latest`.
- `limit` is capped at `100`.
- `search` matches lead `name` or `email`.
- Auth errors from middleware generally return `{ message: "Authentication required" }` or `{ message: "Invalid or expired token" }`.
- Role errors from middleware generally return `{ message: "Forbidden: insufficient permissions" }`.

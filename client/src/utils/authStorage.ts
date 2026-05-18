import type { AuthUser, StoredAuthUser, UserRole } from "../types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "sales";
}

function isStoredAuthUser(value: unknown): value is StoredAuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    isUserRole(record.role)
  );
}

export function saveAuthSession(user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, user.token);
  const stored: StoredAuthUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(stored));
}

export function loadAuthSession(): AuthUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);

  if (!token || !userJson) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(userJson);
    if (!isStoredAuthUser(parsed)) {
      return null;
    }
    return { ...parsed, token };
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

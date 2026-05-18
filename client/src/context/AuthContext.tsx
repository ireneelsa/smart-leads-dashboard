import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type {
  AuthTokenResponse,
  AuthUser,
  IUserProfile,
  UserRole,
} from "../types";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "../utils/authStorage";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileToAuthUser(
  profile: IUserProfile,
  token: string,
): AuthUser {
  return {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    token,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null && user.token.length > 0;

  const setSession = useCallback((authUser: AuthUser) => {
    saveAuthSession(authUser);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthTokenResponse>("/api/auth/login", {
        email,
        password,
      });

      const { data: profile } = await api.get<IUserProfile>("/api/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      setSession(profileToAuthUser(profile, data.token));
    },
    [setSession],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
    ) => {
      const { data } = await api.post<AuthTokenResponse>(
        "/api/auth/register",
        { name, email, password, role },
      );

      const authUser: AuthUser = {
        name,
        email,
        role,
        token: data.token,
      };

      setSession(authUser);
    },
    [setSession],
  );

  useEffect(() => {
    const session = loadAuthSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, loading, isAuthenticated, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

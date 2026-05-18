import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

const THEME_KEY = "theme";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): boolean {
  return localStorage.getItem(THEME_KEY) === "dark";
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedIsDark = getStoredTheme();
    setIsDark(storedIsDark);
    applyTheme(storedIsDark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isDark, toggleTheme }),
    [isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

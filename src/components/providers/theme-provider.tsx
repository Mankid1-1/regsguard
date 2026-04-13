"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextValue {
  darkMode: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Server-side user preference, if available */
  initialDarkMode?: boolean;
}

const STORAGE_KEY = "regsguard-dark-mode";

export function ThemeProvider({
  children,
  initialDarkMode = false,
}: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [mounted, setMounted] = useState(false);

  // On mount, read from localStorage (client overrides server if set)
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setDarkMode(stored === "true");
    }
  }, []);

  // Apply .dark class to html element whenever darkMode changes
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode, mounted]);

  const toggle = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, String(next));

      // Persist to server (fire-and-forget)
      fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode: next }),
      }).catch(() => {
        // Silently fail - localStorage is the source of truth for immediate UX
      });

      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    function apply(t: Theme) {
      const systemDark = mql.matches;
      const resolved = t === "system" ? (systemDark ? "dark" : "light") : t;
      setResolvedTheme(resolved);
      if (t === "system") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", t);
      }
    }

    apply(theme);

    const handler = () => { if (theme === "system") apply("system"); };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

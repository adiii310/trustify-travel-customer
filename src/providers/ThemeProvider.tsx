"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

const KEY = "tt_theme";

type ThemeContextValue = {
  theme: Theme;
  /** What is actually painted right now — "system" resolved against the OS. */
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Runs before paint so the first frame already carries the right theme.
 * Kept in sync with ThemeProvider below.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Pick up the stored preference after hydration.
  useEffect(() => {
    let stored: Theme = "system";
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === "light" || raw === "dark" || raw === "system") stored = raw;
    } catch {
      /* storage blocked */
    }
    setThemeState(stored);
  }, []);

  // Apply the preference to <html> and track the system setting.
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      if (theme === "system") {
        root.removeAttribute("data-theme");
        setResolved(systemPrefersDark() ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", theme);
        setResolved(theme);
      }
    };

    apply();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") apply();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* storage blocked */
    }
  }, []);

  /**
   * Cycles system → opposite-of-current → the other explicit theme → system.
   * Starting from the opposite of what is on screen means the very first tap
   * always changes the appearance, whatever the OS setting is.
   */
  const cycleTheme = useCallback(() => {
    const next: Theme =
      theme === "system"
        ? resolved === "dark"
          ? "light"
          : "dark"
        : theme === "dark"
          ? "light"
          : "dark";

    // Once both explicit themes have been seen, hand control back to the OS.
    const backToSystem =
      theme !== "system" && next === (systemPrefersDark() ? "dark" : "light");

    setTheme(backToSystem ? "system" : next);
  }, [theme, resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

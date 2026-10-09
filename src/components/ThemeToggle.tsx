"use client";

import { useTheme } from "@/providers/ThemeProvider";

const ICON = { light: "☀️", dark: "🌙", system: "🖥️" } as const;

export default function ThemeToggle() {
  const { theme, resolved, cycleTheme } = useTheme();

  const label =
    theme === "system"
      ? `Theme: following your system (${resolved}). Switch to ${
          resolved === "dark" ? "light" : "dark"
        }.`
      : `Theme: ${theme}. Switch to ${theme === "dark" ? "light" : "dark"}.`;

  return (
    <button className="theme-toggle" onClick={cycleTheme} title={label} aria-label={label}>
      <span aria-hidden="true">{ICON[theme]}</span>
    </button>
  );
}

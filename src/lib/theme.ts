import { useCallback, useEffect, useState } from "react";

import { isNightInIstanbul, useNow } from "./time";

/** "auto" follows Istanbul: dark from sunset to sunrise. */
export type ThemeMode = "light" | "auto" | "dark";

const KEY = "jonwill:theme";

function readMode(): ThemeMode {
  // ?theme=dark|light|auto overrides, handy for checking either look.
  const param = new URLSearchParams(window.location.search).get("theme");
  if (param === "light" || param === "dark" || param === "auto") return param;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark" || saved === "auto") return saved;
  } catch {
    // Storage blocked: fall through to auto.
  }
  return "auto";
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const now = useNow(60_000);
  const dark = mode === "dark" || (mode === "auto" && isNightInIstanbul(now));

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Not remembered, but still applied for this visit.
    }
  }, []);

  // Native form controls and scrollbars follow too.
  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  return { mode, setMode, dark };
}

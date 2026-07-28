"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import en from "./en";
import zh from "./zh";

export type Locale = "en" | "zh";

const STORAGE_KEY = "pi-locale";

const translations: Record<Locale, Record<string, string>> = { en, zh };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

function getPreferredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    // ignore
  }
  // Fall back to browser language
  const browserLang = navigator.language?.toLowerCase() || "";
  if (browserLang.startsWith("zh")) return "zh";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Keep SSR and the client's first render identical; restore browser state after hydration.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getPreferredLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale] ?? translations.en;
      let text = dict[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`\${${k}}`, String(v));
        }
      }
      return text;
    },
    [locale],
  );

  // Update html lang attribute when locale changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", locale);
    }
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

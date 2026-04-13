"use client";

import { useCallback } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { translations, type Locale } from "./translations";

/**
 * Client-side translation hook.
 *
 * Usage:
 *   const { t, locale, setLocale } = useTranslation();
 *   <h1>{t("nav.dashboard")}</h1>
 */
export function useTranslation() {
  const { locale, setLocale } = useLocale();

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale as Locale];
      if (dict && key in dict) return dict[key];

      // Fall back to English
      const fallback = translations.en;
      if (key in fallback) return fallback[key];

      // If the key is completely unknown, return the key itself as a last resort
      return key;
    },
    [locale]
  );

  return { t, locale, setLocale };
}

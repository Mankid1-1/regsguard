import { useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { translations, type Locale } from '@/shared/i18n/translations';

export function useTranslation() {
  const locale = useUserStore((s) => s.locale);
  const setLocale = useUserStore((s) => s.setLocale);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale as Locale];
      if (dict && key in dict) return dict[key];
      const fallback = translations.en;
      if (key in fallback) return fallback[key];
      return key;
    },
    [locale]
  );

  return { t, locale, setLocale };
}

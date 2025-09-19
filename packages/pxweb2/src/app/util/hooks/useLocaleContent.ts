import { useEffect, useState } from 'react';
import { fetchLocaleContent } from '../content/localeContent';
import type { LocaleContent } from '../config/localeContentTypes';

export function useLocaleContent(lang: string) {
  const [data, setData] = useState<LocaleContent | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const result = await fetchLocaleContent(lang);
      if (alive) {
        setData(result);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang]);

  return data;
}

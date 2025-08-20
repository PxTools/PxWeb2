import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function useLocalizeDocumentAttributes() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (i18n.resolvedLanguage) {
      document.documentElement.lang = i18n.resolvedLanguage;
      document.documentElement.dir = i18n.dir(i18n.resolvedLanguage);
    }
  }, [i18n, i18n.resolvedLanguage, t]);
}

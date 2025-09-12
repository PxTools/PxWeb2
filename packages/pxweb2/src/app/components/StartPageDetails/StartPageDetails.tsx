import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, BodyLong, Link, DetailsSection } from '@pxweb2/pxweb2-ui';
import type {
  LocaleContent,
  DetailLink,
} from '../../util/config/localeContentTypes';
import styles from './StartPageDetails.module.scss';

async function fetchStartpage(lang: string): Promise<LocaleContent | null> {
  try {
    const res = await fetch(`/locale-content/content.${lang}.json`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as LocaleContent;
  } catch {
    return null;
  }
}

function LinksList({ items }: { items?: DetailLink[] }) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className={styles.linksList}>
      {items.map((link) => {
        return (
          <li key={`${link.url}-${link.text}`} className={styles.linkItem}>
            <Link
              href={link.url}
              icon={link.icon}
              iconPosition="left"
              size="medium"
            >
              {link.text}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function StartPageDetails() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<LocaleContent | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const lang = i18n.language || 'en';
      const data = await fetchStartpage(lang);
      if (alive) {
        setContent(data);
      }
    })();

    return () => {
      alive = false;
    };
  }, [i18n.language]);

  const showDetails = content?.startPage?.showDetails;
  if (!showDetails || showDetails.enabled === false) {
    return null;
  }

  const detailContents = showDetails.detailContent ?? [];
  if (!detailContents.length) {
    return null;
  }

  return (
    <DetailsSection header={showDetails.detailHeader ?? 'More information'}>
      <div className={styles.detailsSection}>
        {detailContents.map((detailContent, index) => {
          return (
            <section
              className={styles.detailContent}
              key={detailContent.header ?? index}
            >
              {detailContent.header && (
                <Heading size="xsmall" className={styles.heading}>
                  {detailContent.header}
                </Heading>
              )}

              {detailContent.text && (
                <BodyLong className={styles.text}>
                  {detailContent.text}
                </BodyLong>
              )}

              {detailContent.linksSection && (
                <div className={styles.linksSection}>
                  {detailContent.linksSection.header && (
                    <Heading size="xsmall" className={styles.linkHeading}>
                      {detailContent.linksSection.header}
                    </Heading>
                  )}
                  {detailContent.linksSection?.links?.length && (
                    <LinksList items={detailContent.linksSection?.links} />
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </DetailsSection>
  );
}

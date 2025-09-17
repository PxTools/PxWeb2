import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BodyLong, Link, DetailsSection } from '@pxweb2/pxweb2-ui';
import type {
  LocaleContent,
  DetailLink,
} from '../../util/config/localeContentTypes';
import cl from 'clsx';
import styles from './StartPageDetails.module.scss';

async function fetchLocaleContent(lang: string): Promise<LocaleContent | null> {
  try {
    const res = await fetch(`/content/${lang}/content.json`, {
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

const renderLinksList = (items?: DetailLink[]) => {
  if (!items?.length) {
    return null;
  }
  return (
    <ul className={styles.linksList}>
      {items.map((link) => (
        <li key={`${link.url}-${link.text}`} className={styles.linkItem}>
          <Link
            href={link.url}
            size="medium"
            {...(link.icon ? { icon: link.icon, iconPosition: 'left' } : {})}
          >
            {link.text}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default function StartPageDetails() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<LocaleContent | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const lang = i18n.language || 'en';
      const data = await fetchLocaleContent(lang);
      if (alive) {
        setContent(data);
      }
    })();

    return () => {
      alive = false;
    };
  }, [i18n.language]);

  const detailsSection = content?.startPage?.detailsSection;
  if (!detailsSection || detailsSection.enabled === false) {
    return null;
  }

  const detailContents = detailsSection.detailContent ?? [];
  if (!detailContents.length) {
    return null;
  }

  return (
    <DetailsSection header={detailsSection.detailHeader ?? 'More information'}>
      <div className={styles.detailsSection}>
        {detailContents.map((detailContent, index) => {
          return (
            <section className={styles.content} key={index}>
              {detailContent.textBlock && (
                <div className={styles.textBlock}>
                  {detailContent.textBlock.header && (
                    <span
                      className={cl(styles.heading, styles['heading-xsmall'])}
                    >
                      {detailContent.textBlock.header}
                    </span>
                  )}

                  {detailContent.textBlock.text && (
                    <BodyLong>{detailContent.textBlock.text}</BodyLong>
                  )}
                </div>
              )}

              {detailContent.links && (
                <div className={styles.linksSection}>
                  {detailContent.links.header && (
                    <span className={styles['heading-xsmall']}>
                      {detailContent.links.header}
                    </span>
                  )}
                  {renderLinksList(detailContent.links.items)}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </DetailsSection>
  );
}

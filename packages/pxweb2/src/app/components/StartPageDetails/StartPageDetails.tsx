import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heading,
  BodyLong,
  Link,
  DetailsSection,
  type IconProps,
} from '@pxweb2/pxweb2-ui';
import styles from './StartPageDetails.module.scss';

type DetailLink = {
  text: string;
  url: string;
  icon?: IconProps['iconName'];
};

type LinksSectionData = {
  header?: string;
  links?: DetailLink[];
};

type DetailBlock = {
  header?: string;
  text?: string;
  linkSection?: LinksSectionData;
};

type StartpageDetailsSection = {
  enabled?: boolean;
  detailHeader?: string;
  detailContent?: DetailBlock[];
};

type StartpageContent = {
  detailsSection?: StartpageDetailsSection;
};

async function fetchStartpage(lang: string): Promise<StartpageContent | null> {
  try {
    const res = await fetch(`/startpage/startpage-${lang}.json`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as StartpageContent;
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
  const [content, setContent] = useState<StartpageContent | null>(null);

  useEffect(() => {
    let alive = true;
  
    (async () => {
      const lang = i18n.language || 'en';
      const data = await fetchStartpage(lang);
      if (alive) {setContent(data);}
    })();
  
    return () => {
      alive = false;
    };
  }, [i18n.language]);  

  const detailsSection = content?.detailsSection;
  if (!detailsSection || detailsSection.enabled === false) {
    return null;
  }

  const detailContents = detailsSection.detailContent ?? [];
  if (!detailContents.length) {
    return null;
  }

  return (
    <DetailsSection header={detailsSection.detailHeader ?? 'More information'}>
      <div className={styles.detailsSections}>
        {detailContents.map((detailContent, index) => {
          return (
            <section
              className={styles.section}
              key={detailContent.header ?? index}
            >
              {detailContent.header && (
                <Heading size="xsmall" className={styles.heading}>
                  {detailContent.header}
                </Heading>
              )}

              {detailContent.text && (
                <BodyLong className={styles.text}>{detailContent.text}</BodyLong>
              )}
              
              {detailContent.linkSection && (
                <div className={styles.linksSection}>
                  {detailContent.linkSection.header && (
                    <Heading size="xsmall" className={styles.linkHeading}>
                      {detailContent.linkSection.header}
                    </Heading>
                  )}
                  <LinksList items={detailContent.linkSection?.links} />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </DetailsSection>
  );
}

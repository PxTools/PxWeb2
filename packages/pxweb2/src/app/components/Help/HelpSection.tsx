import styles from './HelpSection.module.scss';
import { BodyLong, Link, InformationCard } from '@pxweb2/pxweb2-ui';
import type { HelpSection as HelpSectionLocaleContent } from '../../util/config/localeContentTypes';

type HelpSectionProps = Readonly<{
  helpSectionContent: HelpSectionLocaleContent;
}>;

export default function HelpSection({ helpSectionContent }: HelpSectionProps) {
  const { description, links, informationCard } = helpSectionContent;
  const hasLinks = Boolean(links && links.length > 0);
  const hasInfoCard = Boolean(
    informationCard?.enabled && informationCard?.text,
  );
  const hasDescriptionOrLinks = Boolean(description) || hasLinks;

  if (!hasDescriptionOrLinks && !hasInfoCard) {
    return null;
  }

  return (
    <div className={styles.helpSection}>
      {hasDescriptionOrLinks && (
        <div className={styles.descriptionLinksWrapper}>
          {description && (
            <div className={styles.descriptionWrapper}>
              <BodyLong size="medium">{description}</BodyLong>
            </div>
          )}
          {hasLinks && links && (
            <div className={styles.linksWrapper}>
              <ul className={styles.linksList}>
                {links.map((link, idx) => (
                  <li key={`${link.url}-${idx}`} className={styles.linkItem}>
                    <Link
                      href={link.url}
                      size="medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {hasInfoCard && (
        <div className={styles.informationCardWrapper}>
          <InformationCard icon="InformationCircle">
            <BodyLong size="medium">{informationCard!.text}</BodyLong>
          </InformationCard>
        </div>
      )}
    </div>
  );
}

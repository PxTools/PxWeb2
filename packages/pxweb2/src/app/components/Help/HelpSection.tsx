import styles from './HelpSection.module.scss';
import { BodyLong, Link, InformationCard } from '@pxweb2/pxweb2-ui';
import type { HelpSection as HelpSectionLocaleContent } from '../../util/config/localeContentTypes';

type HelpSectionProps = Readonly<{
  helpSectionContent: HelpSectionLocaleContent;
}>;

function LinkList({
  items,
}: Readonly<{
  items: NonNullable<HelpSectionLocaleContent['links']>;
}>) {
  return (
    <ul className={styles.linksList}>
      {items.map((link, idx) => (
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
  );
}

export default function HelpSection({ helpSectionContent }: HelpSectionProps) {
  const { description, links, informationCard } = helpSectionContent;
  const hasLinks = Boolean(links && links.length > 0);
  const hasInfoCard = Boolean(
    informationCard?.enabled && informationCard?.text,
  );

  if (!description && !hasLinks && !hasInfoCard) {
    return null;
  }

  return (
    <div className={styles.helpSection}>
      <div className={styles.descriptionLinksWrapper}>
        {description && (
          <div className={styles.descriptionWrapper}>
            <BodyLong size="medium">{description}</BodyLong>
          </div>
        )}
        {hasLinks && (
          <div className={styles.linksWrapper}>
            <LinkList items={links!} />
          </div>
        )}
      </div>
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

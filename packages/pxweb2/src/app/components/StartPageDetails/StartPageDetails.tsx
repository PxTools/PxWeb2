import { BodyLong, Link, DetailsSection } from '@pxweb2/pxweb2-ui';
import type {
  DetailLink,
  Startpage as StartpageLocaleContent,
} from '../../util/config/localeContentTypes';
import cl from 'clsx';
import styles from './StartPageDetails.module.scss';

type StartPageDetailsProps = Readonly<{
  detailsSection?: StartpageLocaleContent['detailsSection'];
}>;

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
            target={link.openInNewTab ? '_blank' : '_self'}
            {...(link.icon
              ? { icon: link.icon, iconPosition: link.iconPosition ?? 'start' }
              : {})}
          >
            {link.text}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default function StartPageDetails({
  detailsSection,
}: StartPageDetailsProps) {
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
                    <span
                      className={cl(
                        styles.linksHeading,
                        styles['heading-xsmall'],
                      )}
                    >
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

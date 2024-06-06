import React from 'react';
import styles from './Footer.module.scss';
import { BodyLong, Heading, Link } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.footer}>
      <div className={styles.logos}>
        <img alt="SCB logo" src="./images/scb-logo.png" />{' '}
        <img alt="SSB logo" src="./images/ssb-logo.png" />
      </div>
      <div>
        <BodyLong>
          {t('presentation_page.footer.description')}{' '}
          <Link href="https://github.com/PxTools/PxWeb2">
            {t('presentation_page.footer.descriptionLink')}
          </Link>
        </BodyLong>
      </div>
      <div className={styles.contact}>
        <Heading size="xsmall" level="3">
          {t('presentation_page.footer.contact')}
        </Heading>

        <BodyLong>
          {t('presentation_page.footer.projectLeader')}: Kristin Glomsås,{' '}
          <Link href="mailto:krg@ssb.no">krg@ssb.no</Link>
        </BodyLong>
        <div className={styles.contactCopyrightWrapper}>
          <div>
            <BodyLong>
              {t('presentation_page.footer.scrumMaster')}: Åsa Arrhén,{' '}
              <Link href="mailto:asa.arrhen@scb.se">asa.arrhen@scb.se</Link>
            </BodyLong>
          </div>

          <div>
            <BodyLong>{t('presentation_page.footer.copyright')}</BodyLong>
          </div>
        </div>
      </div>
    </div>
  );
};

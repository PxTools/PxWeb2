import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';
import { BodyLong, Heading, Link } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';

type FooterLink = { text: string; url: string };
type FooterColumn = { header: string; links: FooterLink[] };

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [columns, setColumns] = useState<FooterColumn[]>([]);

  useEffect(() => {
    const lang = i18n.language || 'en';
    fetch(`/footer-links/footer-links.${lang}.json`)
      .then((res) =>
        res.ok
          ? res.json()
          : fetch(`/footer-links/footer-links.en.json`).then((r) => r.json()),
      )
      .then(setColumns)
      .catch(() => setColumns([]));
  }, [i18n.language]);

  return (
    <footer className={styles.footer}>
      <div className={styles.logos}>
        <img alt="SCB logo" src="/images/scb-logo.svg" />{' '}
        <img alt="SSB logo" src="/images/ssb-logo.svg" />
      </div>
      <div className={styles.description}>
        <BodyLong>
          {t('presentation_page.footer.description')}{' '}
          <Link
            inline={true}
            target="_blank"
            href="https://github.com/PxTools/PxWeb2"
          >
            {t('presentation_page.footer.descriptionLink')}
          </Link>
          .
        </BodyLong>
      </div>
      <div className={styles.contact}>
        <Heading size="xsmall" level="2">
          {t('presentation_page.footer.contact')}
        </Heading>

        <BodyLong>
          {t('presentation_page.footer.projectLeader')}: Kristin Glomsås,{' '}
          <Link inline={true} href="mailto:krg@ssb.no">
            krg@ssb.no
          </Link>
        </BodyLong>
        <div className={styles.contactCopyrightWrapper}>
          <div>
            <BodyLong>
              {t('presentation_page.footer.scrumMaster')}: Åsa Arrhén,{' '}
              <Link inline={true} href="mailto:asa.arrhen@scb.se">
                asa.arrhen@scb.se
              </Link>
            </BodyLong>
          </div>
        </div>
        <div className={styles.copyright}>
          <BodyLong>{t('presentation_page.footer.copyright')}</BodyLong>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {columns.map((col, colIdx) => (
          <div key={colIdx}>
            <h4>{col.header}</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {col.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
};

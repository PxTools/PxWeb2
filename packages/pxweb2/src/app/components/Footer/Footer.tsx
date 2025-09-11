import cl from 'clsx';
import React, { useEffect, useState } from 'react';

import styles from './Footer.module.scss';
import { Heading, Link } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';

type FooterLink = { text: string; url: string };
type FooterColumn = { header: string; links: FooterLink[] };
type FooterConfig = {
  image?: string;
  description?: string;
  columns: FooterColumn[];
};

export const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const [config, setConfig] = useState<FooterConfig>({ columns: [] });

  useEffect(() => {
    const lang = i18n.language || 'en';
    fetch(`/locale-content/content.${lang}.json`)
      .then((res) =>
        res.ok
          ? res.json()
          : fetch(`/locale-content/content.en.json`).then((r) => r.json()),
      )
      .then((data) => setConfig(data.footer || { columns: [] }))
      .catch(() => setConfig({ columns: [] }));
  }, [i18n.language]);

  return (
    <footer className={styles.footer}>
      <div className={cl(styles.logoAndLinks)}>
        <div className={cl(styles.logoContainer)}>
          {config.image && <img src={config.image} alt="" />}
        </div>
        <div className={cl(styles.footerLinks)}>
          {config.columns.map((col) => (
            <div className={cl(styles.footerLinkGroup)} key={col.header}>
              <Heading size="small" level="2">
                {col.header}
              </Heading>
              <div className={cl(styles.footerLinkList)}>
                {col.links.map((link) => (
                  <Link href={link.url} size="small" key={link.url}>
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* {config.image && (
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <img
            src={config.image}
            alt=""
            style={{ maxWidth: '200px', height: 'auto' }}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: '2rem', paddingTop: '2rem' }}>
        {config.columns.map((col, colIdx) => (
          <div key={colIdx}>
            <Heading size="small" level="4">
              {col.header}
            </Heading>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {col.links.map((link) => (
                <li key={link.url}>
                  <Link href={link.url} size="small">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div> */}

      {/* <div className={styles.logos}>
        <img alt="SCB logo" src="./images/scb-logo.svg" />{' '}
        <img alt="SSB logo" src="./images/ssb-logo.svg" />
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
      </div> */}
    </footer>
  );
};

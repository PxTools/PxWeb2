import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';
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
    fetch(`/footer-links/footer-links.${lang}.json`)
      .then((res) =>
        res.ok
          ? res.json()
          : fetch(`/footer-links/footer-links.en.json`).then((r) => r.json()),
      )
      .then(setConfig)
      .catch(() => setConfig({ columns: [] }));
  }, [i18n.language]);

  return (
    <footer className={styles.footer}>
      {config.image && (
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <img
            src={config.image}
            alt=""
            style={{ maxWidth: '200px', height: 'auto' }}
          />
        </div>
      )}
      {config.description && (
        <div
          style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}
        >
          {config.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {config.columns.map((col, colIdx) => (
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

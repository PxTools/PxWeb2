import cl from 'clsx';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Footer.module.scss';
import { getConfig } from '../../util/config/getConfig';
import { BodyShort, Button, Heading, Link } from '@pxweb2/pxweb2-ui';

type FooterProps = {
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

export function scrollToTop(ref?: React.RefObject<HTMLDivElement | null>) {
  if (ref?.current) {
    const container = ref.current;
    const start = container.scrollTop;
    const duration = 200; // ms, decrease for even faster scroll
    const startTime = performance.now();

    function animateScroll(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = start * (1 - progress);
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
    requestAnimationFrame(animateScroll);
  }
}

export const Footer: React.FC<FooterProps> = ({ containerRef }) => {
  type FooterLink = {
    text: string;
    url: string;
    external?: boolean;
  };
  const config = getConfig();
  type FooterColumn = { header: string; links: FooterLink[] };
  type FooterConfig = {
    image?: string;
    description?: string;
    columns: FooterColumn[];
  };
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    columns: [],
  });
  // Ref for the main scrollable container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lang = i18n.language || 'en';
    fetch(`/content/${lang}/content.json`)
      .then((res) =>
        res.ok
          ? res.json()
          : fetch(`/content/en/content.json`).then((r) => r.json()),
      )
      .then((data) => setFooterConfig(data.footer || { columns: [] }))
      .catch(() => setFooterConfig({ columns: [] }));
  }, [i18n.language]);

  return (
    <footer className={styles.footerContainer} ref={scrollContainerRef}>
      <div className={cl(styles.footer)}>
        <div className={cl(styles.footerContent)}>
          <div className={cl(styles.logoAndLinks)}>
            <div className={cl(styles.logoContainer)}>
              {footerConfig.image && (
                <img src={footerConfig.image} alt="Logo" />
              )}
            </div>
            <div className={cl(styles.footerLinks)}>
              {footerConfig.columns.map((col) => (
                <div className={cl(styles.footerLinkGroup)} key={col.header}>
                  <Heading size="small" level="2">
                    {col.header}
                  </Heading>
                  <div className={cl(styles.footerLinkList)}>
                    {col.links.map((link) => {
                      const showIcon = link.external === true;
                      const iconProps = showIcon
                        ? {
                            icon: 'ExternalLink' as const,
                            iconPosition: 'right' as const,
                            target: '_blank' as const,
                          }
                        : {};
                      return (
                        <Link
                          inline={false}
                          href={link.url}
                          size="small"
                          key={link.url}
                          {...iconProps}
                        >
                          {link.text}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className={cl(styles.footerLinkGroup)}>
                <Heading size="small" level="2">
                  {t('common.footer.language_header')}
                </Heading>
                <div className={cl(styles.footerLinkList)}>
                  {Array.isArray(config?.language?.supportedLanguages) &&
                    config.language.supportedLanguages.map(
                      (lang: { shorthand: string; languageName: string }) => (
                        <Link
                          inline={false}
                          href="#"
                          size="small"
                          key={lang.shorthand}
                          aria-current={
                            i18n.language?.startsWith(lang.shorthand)
                              ? 'true'
                              : undefined
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            if (!i18n.language?.startsWith(lang.shorthand)) {
                              i18n.changeLanguage(lang.shorthand);
                            }
                          }}
                        >
                          {lang.languageName || lang.shorthand.toUpperCase()}
                        </Link>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
          <div className={cl(styles.copyrightAndButton)}>
            <div className={cl(styles.copyrightWrapper)}>
              <BodyShort size="medium">
                {t('common.footer.copyright')}
              </BodyShort>
            </div>
            <Button
              icon="ArrowUp"
              variant="secondary"
              size="medium"
              onClick={() => scrollToTop(containerRef)}
            >
              {t('common.footer.top_button_text')}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

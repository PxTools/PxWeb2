import cl from 'clsx';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Footer.module.scss';
import { getConfig } from '../../util/config/getConfig';
import { BodyShort, Button, Heading, Link } from '@pxweb2/pxweb2-ui';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';

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
  const { i18n, t } = useTranslation();
  const config = getConfig();
  const content = useLocaleContent(
    i18n.language || config.language.defaultLanguage,
  );
  const footerContent = content?.footer;
  // Ref for the main scrollable container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <footer className={styles.footerContainer} ref={scrollContainerRef}>
      <div className={cl(styles.footer)}>
        <div className={cl(styles.footerContent)}>
          <div className={cl(styles.logoAndLinks)}>
            <div className={cl(styles.footerLinks)}>
              {footerContent?.columns.map((col) => (
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
                          href={link.url}
                          size="medium"
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
                          href="#"
                          size="medium"
                          key={lang.shorthand}
                          lang={lang.shorthand}
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
            {containerRef && (
              <Button
                icon="ArrowUp"
                variant="secondary"
                size="medium"
                onClick={() => scrollToTop(containerRef)}
              >
                {t('common.footer.top_button_text')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

import cl from 'clsx';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
// Navlink imported once for language links

import styles from './Footer.module.scss';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';
import { BodyShort, Button, Heading, Link } from '@pxweb2/pxweb2-ui';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';
import Navlink from '../Navlink/Navlink';

function useSafeLocation(): { pathname: string } {
  try {
    // Attempt router location
    return useLocation() as { pathname: string };
  } catch {
    // Fallback to global location when outside Router
    return { pathname: globalThis.location?.pathname || '/' };
  }
}

type FooterProps = {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  variant?: 'generic' | 'tableview';
  enableWindowScroll?: boolean;
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

export const Footer: React.FC<FooterProps> = ({
  containerRef,
  variant = 'generic',
  enableWindowScroll = false,
}) => {
  const { i18n, t } = useTranslation();
  const config = getConfig();
  const content = useLocaleContent(
    i18n.language || config.language.defaultLanguage,
  );
  const footerContent = content?.footer;
  // Ref for the main scrollable container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const location = useSafeLocation();

  const canShowTopButton = !!containerRef || enableWindowScroll;

  const handleScrollTop = () => {
    if (containerRef?.current) {
      scrollToTop(containerRef);
    } else if (enableWindowScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      className={cl(styles.footerContainer, styles[`variant--${variant}`])}
      ref={scrollContainerRef}
    >
      <div className={styles.footer}>
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
                            iconPosition: 'end' as const,
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
                      (lang: { shorthand: string; languageName: string }) => {
                        const basePath = config.baseApplicationPath.replace(
                          /\/$/,
                          '',
                        );
                        const languageHref =
                          basePath +
                          getLanguagePath(
                            location.pathname,
                            lang.shorthand,
                            config.language.supportedLanguages,
                            config.language.defaultLanguage,
                            config.language.showDefaultLanguageInPath,
                          );
                        const isCurrent = i18n.language?.startsWith(
                          lang.shorthand,
                        );
                        return (
                          <Navlink
                            to={languageHref}
                            size="medium"
                            key={lang.shorthand}
                            lang={lang.shorthand}
                            aria-current={isCurrent ? 'true' : undefined}
                            onClick={() => {
                              if (!isCurrent) {
                                i18n.changeLanguage(lang.shorthand);
                              }
                            }}
                          >
                            {lang.languageName || lang.shorthand.toUpperCase()}
                          </Navlink>
                        );
                      },
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
            {canShowTopButton && (
              <Button
                icon="ArrowUp"
                variant="secondary"
                size="medium"
                onClick={handleScrollTop}
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

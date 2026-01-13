import cl from 'clsx';

import styles from './ErrorLayout.module.scss';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

interface ErrorContentProps extends Pick<
  ErrorLayoutProps,
  'align' | 'children'
> {}

function ErrorContent({ align = 'center', children }: ErrorContentProps) {
  return (
    <>
      <div
        className={cl(
          styles.contentWrapper,
          align === 'center'
            ? styles.layoutAlignCenter
            : styles.layoutAlignStart,
        )}
      >
        <div className={cl(styles.container)}>
          <main
            className={cl(
              styles.mainContent,
              align === 'center' ? styles.alignCenter : styles.alignStart,
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <div className={cl(styles.footerContent)}>
        <div className={cl(styles.footerContainer)}>
          <Footer />
        </div>
      </div>
    </>
  );
}

interface ErrorLayoutProps {
  readonly align?: 'center' | 'start';
  readonly children: React.ReactNode;
}

// Layout component for error pages, includes header and styles
// Used as wrapper around error content, not as an error route element itself
export function ErrorLayout({ align = 'center', children }: ErrorLayoutProps) {
  return (
    <div className={cl(styles.fullScreenContainer)}>
      <Header stroke={true} />
      <ErrorContent align={align}>{children}</ErrorContent>
    </div>
  );
}

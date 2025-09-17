import cl from 'clsx';

import styles from './ErrorLayout.module.scss';
import { Header } from '../Header/Header';

interface ErrorLayoutProps {
  readonly isStartPageGenericError?: boolean;
  readonly align?: 'center' | 'start';
  readonly children: React.ReactNode;
}

// Layout component for error pages, includes header and styles
// Used as wrapper around error content, not as an error route element itself
export function ErrorLayout({
  isStartPageGenericError = false,
  align = 'center',
  children,
}: ErrorLayoutProps) {
  if (isStartPageGenericError) {
    return (
      <>
        <div className={cl(styles.fullScreenContainer)}>
          <main
            className={cl(
              styles.mainContent,
              align === 'center' ? styles.alignCenter : styles.alignStart,
            )}
          >
            {children}
          </main>
        </div>
        <div>Footer Component goes here</div>
      </>
    );
  }

  return (
    <>
      <Header stroke={true} />
      <div className={cl(styles.fullScreenContainer)}>
        <main
          className={cl(
            styles.mainContent,
            align === 'center' ? styles.alignCenter : styles.alignStart,
          )}
        >
          {children}
        </main>
      </div>
      <div>Footer Component goes here</div>
    </>
  );
}

import cl from 'clsx';

import styles from './ErrorLayout.module.scss';
import { Header } from '../Header/Header';

interface ErrorLayoutProps {
  isStartPageGenericError?: boolean;
  children: React.ReactNode;
}

// Layout component for error pages, includes header and styles
// Used as wrapper around error content, not as an error route element itself
export function ErrorLayout({
  isStartPageGenericError = false,
  children,
}: ErrorLayoutProps) {
  if (isStartPageGenericError) {
    return (
      <>
        <div className={cl(styles.fullScreenContainer)}>
          <main className={cl(styles.mainContent)}>{children}</main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={cl(styles.fullScreenContainer)}>
        <main className={cl(styles.mainContent)}>{children}</main>
      </div>
    </>
  );
}

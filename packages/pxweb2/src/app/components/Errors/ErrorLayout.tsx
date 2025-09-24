import cl from 'clsx';

import styles from './ErrorLayout.module.scss';
import { Header } from '../Header/Header';

interface ErrorContentProps
  extends Pick<ErrorLayoutProps, 'align' | 'children'> {}

function ErrorContent({ align = 'center', children }: ErrorContentProps) {
  return (
    <>
      <div className={cl(styles.fullScreenContainer)}>
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
      <div>Footer Component goes here</div>
    </>
  );
}

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
    return <ErrorContent align={align}>{children}</ErrorContent>;
  }

  return (
    <>
      <Header stroke={true} />
      <ErrorContent align={align}>{children}</ErrorContent>
    </>
  );
}

import cl from 'clsx';

import styles from './ErrorLayout.module.scss';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

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
      <div className={cl(styles.footerContent)}>
        <div className={cl(styles.footerContainer)}>
          <Footer variant="startpage" />
        </div>
      </div>
    </>
  );
}

interface ErrorLayoutProps {
  readonly withoutHeader?: boolean;
  readonly align?: 'center' | 'start';
  readonly children: React.ReactNode;
}

// Layout component for error pages, includes header and styles
// Used as wrapper around error content, not as an error route element itself
export function ErrorLayout({
  withoutHeader = false,
  align = 'center',
  children,
}: ErrorLayoutProps) {
  if (withoutHeader) {
    return <ErrorContent align={align}>{children}</ErrorContent>;
  }

  return (
    <>
      <Header stroke={true} />
      <ErrorContent align={align}>{children}</ErrorContent>
    </>
  );
}

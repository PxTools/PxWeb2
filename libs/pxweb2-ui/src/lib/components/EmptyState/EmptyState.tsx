import { useEffect, useState } from 'react';
import cl from 'clsx';

import styles from './EmptyState.module.scss';
import * as Illustrations from './Illustrations';
import { BreakpointsXsmallMaxWidth } from '../../../../style-dictionary/dist/js/fixed-variables.js';

export interface EmptyStateProps {
  svgName: keyof typeof Illustrations;
  headingTxt: string;
  descriptionTxt: string;
}

export function EmptyState({
  svgName,
  headingTxt,
  descriptionTxt,
}: EmptyStateProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  let illustration = Illustrations[svgName].large;
  const breakpoint = Number(BreakpointsXsmallMaxWidth.replace('px', ''));

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (breakpoint > windowWidth) {
    illustration = Illustrations[svgName].small;
  }

  if (!illustration) {
    return null; // TODO:Add error message here?
  }

  return (
    <div className={cl(styles['empty-state'])}>
      <div className={cl(styles['empty-state-content'])}>
        <div className={cl(styles['empty-state-illustration'])}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={illustration.viewBox}
            role="img"
            aria-label={headingTxt + '. ' + descriptionTxt}
          >
            {illustration.paths}
          </svg>
        </div>
        <div className={cl(styles['empty-state-text'])}>
          <div
            className={cl(
              styles['empty-state-heading'],
              styles['heading-small']
            )}
          >
            {headingTxt}
          </div>
          <div
            className={cl(
              styles['empty-state-description'],
              styles['bodyshort-medium']
            )}
          >
            {descriptionTxt}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

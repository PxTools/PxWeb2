import { useEffect, useState } from 'react';
import cl from 'clsx';

import styles from './EmptyState.module.scss';
import * as Illustrations from './Illustrations';
import { BreakpointsXsmallMaxWidth } from '../../../../style-dictionary/dist/js/fixed-variables.js';

export interface EmptyStateProps {
  svgName: keyof typeof Illustrations;
  headingTxt: string;
  illustrationAltText: string;
  children: React.ReactNode;
}

export function EmptyState({
  svgName,
  headingTxt,
  illustrationAltText,
  children,
}: EmptyStateProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  let illustration = Illustrations[svgName].large;
  let viewBoxSizes = '0 0 277 144';
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
    viewBoxSizes = '0 0 208 108';
  }

  if (!illustration) {
    return null;
  }

  /*
   * TODO:
   * - Ask about viewBox values and figma, one illustrantion has them, the other has many groups instead
   * - - viewBox="0 0 277 144" viewBox="0 0 208 108" are rounded up from figma
   * - - should these be hardcoded like this? will all illustrations have the same viewBox values? for large and small?
   * - how do we handle the colors of the illustrations? should you be able to customize them?
   * - - the colors are now hardcoded, since one illustration has many lines of different colors
   * - - - can fix
   * - - in figma some colors are name as "bluegray" etc,
   *     but should we use color names here? then if someone wants to change the colors to non-blue
   *     they will have to overwrite "bluegray" with green for example
   *        maybe better to never use such color names?
   * - Fix the styling, currently has not checked thoroughly
   */

  return (
    <div className={cl(styles['empty-state'])}>
      <div className={cl(styles['empty-state-content'])}>
        <div className={cl(styles['empty-state-illustration'])}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBoxSizes}
            role="img"
            aria-label={illustrationAltText}
          >
            {illustration}
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
            <p>{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

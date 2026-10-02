import { useEffect, useState } from 'react';

/**
 * Reads the browser's root font size so chart dimensions expressed in `rem`
 * can be converted to pixels. A default of 16 pixels keeps the chart usable
 * during server-side rendering or when the browser does not provide a valid
 * font size.
 */
function getPixelsPerRem(): number {
  if (typeof document === 'undefined') {
    return 16;
  }

  const rootFontSize = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  return Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : 16;
}

/**
 * Keeps the current root font size available to charts in pixels.
 *
 * Chart dimensions use `rem`, but ECharts needs pixel values for some of its
 * calculations. Because `1rem` depends on the browser's root font size, this
 * hook updates the value when the page layout or browser window changes.
 */
export function useResponsivePixelsPerRem(): number {
  // Read the root font size when the hook is first used.
  const [pixelsPerRem, setPixelsPerRem] = useState(getPixelsPerRem);

  useEffect(() => {
    // Re-read the root font size and update React state only when it changed.
    const updatePixelsPerRem = () => {
      const nextPixelsPerRem = getPixelsPerRem();
      setPixelsPerRem((previousPixelsPerRem) =>
        previousPixelsPerRem === nextPixelsPerRem
          ? previousPixelsPerRem
          : nextPixelsPerRem,
      );
    };

    // A ResizeObserver detects layout changes, while the window resize event
    // covers changes caused by resizing the browser window or viewport.
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updatePixelsPerRem);

    resizeObserver?.observe(document.documentElement);
    window.addEventListener('resize', updatePixelsPerRem);

    // Remove both listeners when the component is unmounted or the effect is
    // rerun, preventing stale listeners and memory leaks.
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePixelsPerRem);
    };
  }, []);

  // Return the latest root font size so the chart can calculate its dimensions.
  return pixelsPerRem;
}

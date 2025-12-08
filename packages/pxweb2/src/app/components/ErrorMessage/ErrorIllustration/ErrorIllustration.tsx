import cl from 'clsx';

import classes from './ErrorIllustration.module.scss';
import { Illustrations } from './Illustrations';
import { Backgrounds } from './Backgrounds';

export type BackgroundShapeType = keyof typeof Backgrounds;
export type IllustrationNameType = keyof typeof Illustrations;

interface ErrorIllustrationProps {
  readonly backgroundShape: BackgroundShapeType;
  readonly illustrationName: IllustrationNameType;
  readonly size?: 'small' | 'medium';
}

export function ErrorIllustration({
  backgroundShape,
  illustrationName,
  size = 'medium',
}: ErrorIllustrationProps) {
  const illustrationVariant = Illustrations[illustrationName];
  const backgroundVariant = Backgrounds[backgroundShape];

  if (!illustrationVariant || !backgroundVariant) {
    return null;
  }

  const illustration = illustrationVariant[size] ?? illustrationVariant.medium;
  const background = backgroundVariant[size] ?? backgroundVariant.medium;

  return (
    <div className={cl(classes.illustrationContainer)}>
      <svg
        role="presentation"
        width={background.width}
        height={background.height}
        viewBox={background.viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        {background.backgroundElement}
      </svg>
      <svg
        role="presentation"
        width={illustration.width}
        height={illustration.height}
        viewBox={illustration.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className={cl(classes.illustration)}
      >
        {illustration.paths}
      </svg>
    </div>
  );
}

import cl from 'clsx';

import classes from './ErrorIllustration.module.scss';
import * as Illustrations from './Illustrations';
import * as Backgrounds from './Backgrounds';

export type BackgroundShapeType = keyof typeof Backgrounds;
export type IllustrationNameType = keyof typeof Illustrations;

interface ErrorIllustrationProps {
  readonly backgroundShape: BackgroundShapeType;
  readonly illustrationName: IllustrationNameType;
}

export function ErrorIllustration({
  backgroundShape,
  illustrationName,
}: ErrorIllustrationProps) {
  const illustration = Illustrations[illustrationName];

  if (!illustration) {
    console.log(
      `ErrorIllustration: Illustration ${illustrationName} not found`,
    );
    return null;
  }

  const backgroundElement = Backgrounds[backgroundShape];
  if (!backgroundElement) {
    console.log(
      `ErrorIllustration: Background shape "${backgroundShape}" for illustration ${illustrationName} not found`,
    );
    return null;
  }

  return (
    <div className={cl(classes.illustrationContainer)}>
      <svg
        role="presentation"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {backgroundElement}
      </svg>
      <svg
        role="presentation"
        width="90"
        height="92"
        viewBox="0 0 90 92"
        xmlns="http://www.w3.org/2000/svg"
        className={cl(classes.illustration)}
      >
        {illustration.paths}
      </svg>
    </div>
  );
}

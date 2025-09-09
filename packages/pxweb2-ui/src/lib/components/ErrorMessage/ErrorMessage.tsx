import cl from 'clsx';

import classes from './ErrorMessage.module.scss';
import { ErrorAction } from './ErrorAction/ErrorAction';
import {
  ErrorIllustration,
  BackgroundShapeType,
  IllustrationNameType,
} from './ErrorIllustration/ErrorIllustration';

export interface ErrorMessageProps {
  action: 'button' | 'link';
  align: 'start' | 'center';
  size: 'small' | 'large';
  backgroundShape?: BackgroundShapeType;
  statusCode?: number;
  title: string;
  description: string;
  actionText: string;
}

export function ErrorMessage({
  action,
  align,
  size,
  statusCode,
  backgroundShape = 'circle',
  title,
  description,
  actionText,
}: ErrorMessageProps) {
  let illustration: IllustrationNameType = 'GenericError';

  if (statusCode === 404) {
    illustration = 'NotFound';
  }

  return (
    <div className={cl(classes[`align-${align}`])}>
      <ErrorIllustration
        backgroundShape={backgroundShape}
        illustrationName={illustration}
      />
      <div className={cl(classes[`size-${size}`])}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className={cl(classes[`size-${size}`])}>
        <ErrorAction action={action} actionText={actionText} />
      </div>
    </div>
  );
}

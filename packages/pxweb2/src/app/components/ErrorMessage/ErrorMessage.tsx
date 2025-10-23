import cl from 'clsx';

import classes from './ErrorMessage.module.scss';
import { ErrorAction } from './ErrorAction/ErrorAction';
import { ErrorIllustration } from './ErrorIllustration/ErrorIllustration';
import { Heading, Ingress, BodyLong } from '@pxweb2/pxweb2-ui';
import { ErrorMessageProps } from './types';

export function ErrorMessage({
  action,
  align,
  size,
  illustration = 'GenericError',
  backgroundShape = 'circle',
  headingLevel = '1',
  title,
  description,
  actionText,
}: ErrorMessageProps) {
  const headingSize = size === 'small' ? 'medium' : 'large';
  const illustrationSize = size === 'small' ? 'small' : 'medium';

  return (
    <div
      className={cl(
        classes.errorMessage,
        align === 'center' ? classes.alignCenter : classes.alignStart,
        size === 'small' ? classes.small : undefined,
      )}
    >
      <ErrorIllustration
        backgroundShape={backgroundShape}
        illustrationName={illustration}
        size={illustrationSize}
      />

      <div
        role="alert"
        className={cl(
          classes.textAndAction,
          align === 'center' ? classes.alignCenter : classes.alignStart,
          size === 'small' ? classes.small : undefined,
        )}
      >
        <div
          className={cl(
            classes.text,
            align === 'center' ? classes.alignCenter : classes.alignStart,
            size === 'small' ? classes.small : undefined,
          )}
        >
          <Heading level={headingLevel} align={align} size={headingSize}>
            {title}
          </Heading>
          {size === 'small' ? (
            <BodyLong
              className={cl({ [classes.alignCenter]: align === 'center' })}
            >
              {description}
            </BodyLong>
          ) : (
            <Ingress
              className={cl({ [classes.alignCenter]: align === 'center' })}
            >
              {description}
            </Ingress>
          )}
        </div>

        <Ingress>
          <ErrorAction action={action} actionText={actionText} align={align} />
        </Ingress>
      </div>
    </div>
  );
}

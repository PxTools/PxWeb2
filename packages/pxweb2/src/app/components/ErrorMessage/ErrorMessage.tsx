import cl from 'clsx';

import classes from './ErrorMessage.module.scss';
import { ErrorAction } from './ErrorAction/ErrorAction';
import { ErrorIllustration } from './ErrorIllustration/ErrorIllustration';
import { Heading, Ingress } from '@pxweb2/pxweb2-ui';
import { ErrorMessageProps } from './types';

export function ErrorMessage({
  action,
  align,
  illustration = 'GenericError',
  backgroundShape = 'circle',
  title,
  description,
  actionText,
}: ErrorMessageProps) {
  return (
    <div className={cl(classes.errorMessage, classes[`align-${align}`])}>
      <ErrorIllustration
        backgroundShape={backgroundShape}
        illustrationName={illustration}
      />

      <div className={cl(classes.textAndAction, classes[`align-${align}`])}>
        <div className={cl(classes.text, classes[`align-${align}`])}>
          <Heading level="1" align={align} size="large">
            {title}
          </Heading>
          <Ingress>{description}</Ingress>
        </div>

        <Ingress>
          <ErrorAction action={action} actionText={actionText} />
        </Ingress>
      </div>
    </div>
  );
}
